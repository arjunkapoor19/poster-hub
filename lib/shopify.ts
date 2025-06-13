// /lib/shopify.ts

export type ShopifyImage = {
  url: string;
  altText: string | null;
};

export type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  price: MoneyV2;
  image: ShopifyImage;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string | null; // <--- FIX: Added this property to match the data being fetched.
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ProductVariant }[];
  };
};

export type LineItem = {
  node: {
    title: string;
    quantity: number;
    variant: {
      title: string;
      image: ShopifyImage;
    };
  };
};

export type Order = {
  id: string;
  name: string; // The order number, e.g., "#1001"
  processedAt: string;
  financialStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'VOIDED';
  fulfillmentStatus: 'FULFILLED' | 'UNFULFILLED' | 'PARTIALLY_FULFILLED';
  totalPrice: MoneyV2;
  lineItems: {
    edges: LineItem[];
  };
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  // We can add more fields as needed, like addresses.
};

// Types for API responses which include the "edges" and "node" nesting
type ProductsAPIResponse = { products: { edges: { node: Product }[] } };
type ProductByHandleAPIResponse = { product: Product | null };
type CustomerAPIResponse = { customer: (Customer & { orders: { edges: { node: Order }[] } }) | null };


// ================================================================= //
//                      THE CORE FETCH ENGINE                        //
// This generic function handles all communication with the API.     //
// ================================================================= //

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_ENDPOINT = `https://${domain}/api/2023-10/graphql.json`;

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const response = await fetch(SHOPIFY_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error("Shopify Errors:", result.errors);
    throw new Error("Failed to fetch from Shopify API.");
  }
  
  return result.data;
}


// ================================================================= //
//                      EXPORTED HELPER FUNCTIONS                    //
// These are the specific, high-level functions you'll use in your app. //
// ================================================================= //

// --- Product Functions ---

/**
 * Fetches all products from your Shopify store.
 * @returns {Promise<Product[]>} A list of products.
 */
export async function getProducts(): Promise<Product[]> {
  const query = `
    query getProducts {
      products(first: 250) {
        edges {
          node {
            id
            handle
            title
            description
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<ProductsAPIResponse>({ query });
  return response.products.edges.map(edge => edge.node);
}

/**
 * Fetches a single product by its handle (URL slug).
 * @param {string} handle - The product's handle.
 * @returns {Promise<Product | null>} The product object or null if not found.
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price { amount currencyCode }
              image { url altText }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<ProductByHandleAPIResponse>({ 
    query, 
    variables: { handle } 
  });
  return response.product;
}

// --- Customer & Order Functions (Authenticated) ---

/**
 * Fetches the currently logged-in customer's data, including their orders.
 * @param {string} customerAccessToken - The customer's access token from a cookie.
 * @returns {Promise<{customer: Customer, orders: Order[]} | null>} An object with customer and order details, or null if token is invalid.
 */
export async function getCustomerData(customerAccessToken: string): Promise<{ customer: Customer; orders: Order[] } | null> {
  const query = `
    query getCustomerData($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<CustomerAPIResponse>({ 
    query, 
    variables: { customerAccessToken } 
  });

  if (!response.customer) {
    return null; // Token is invalid or expired
  }
  
  const { orders, ...customerDetails } = response.customer;
  const customerOrders = orders.edges.map(edge => edge.node);

  return {
    customer: customerDetails,
    orders: customerOrders,
  };
}

/**
 * Fetches products from a specific collection by its handle.
 * @param {string} collectionHandle - The handle of the collection (e.g., 'latest-drops').
 * @returns {Promise<Product[]>} A list of products found in that collection.
 */
export async function getProductsInCollection(collectionHandle: string): Promise<Product[]> {
  const query = `
    query getProductsInCollection($handle: String!) {
      collection(handle: $handle) {
        products(first: 10) { # Fetches up to 10 products from the collection
          edges {
            node {
              id
              handle
              title
              productType
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  type ResponseType = {
    collection: {
      products: {
        edges: { node: Product }[]
      }
    } | null
  };

  const response = await shopifyFetch<ResponseType>({ 
    query, 
    variables: { handle: collectionHandle } 
  });

  return response.collection?.products?.edges.map(edge => edge.node) || [];
}

// In /lib/shopify.ts

/**
 * Searches for products in the store using a more robust query.
 * @param {string} searchTerm - The term to search for.
 * @returns {Promise<Product[]>} A list of matching products. ALWAYS returns an array.
 */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const query = `
    query searchProducts($searchQuery: String!) {
      products(first: 10, query: $searchQuery) {
        edges {
          node {
            id
            handle
            title
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    searchQuery: `title:*${searchTerm}* OR tag:${searchTerm}`,
  };

  try {
    const response = await shopifyFetch<{ products: { edges: { node: Product }[] } | null }>({ 
      query,
      variables
    });

    // --- THIS IS THE KEY DEFENSIVE CHECK ---
    // If response.products is null or doesn't have edges, return an empty array.
    if (!response.products?.edges) {
      console.log("Shopify search returned no products or a null response.");
      return [];
    }
    
    // If we get here, we know we have a valid array of edges.
    return response.products.edges.map(edge => edge.node);

  } catch (error) {
    console.error("Error in searchProducts function:", error);
    // If the entire fetch fails, still return an empty array so the UI doesn't crash.
    return [];
  }
}