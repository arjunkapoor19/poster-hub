// /lib/shopify.ts

// --- Base Types ---
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
  productType: string | null;
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
  name: string;
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
};
export type CustomerAccessToken = {
  accessToken: string;
  expiresAt: string;
};

// --- API Response Types ---
type ProductsAPIResponse = { products: { edges: { node: Product }[] } };
type ProductByHandleAPIResponse = { product: Product | null };
type CustomerAPIResponse = { customer: (Customer & { orders: { edges: { node: Order }[] } }) | null };


// ================================================================= //
//                      THE CORE FETCH ENGINE                        //
// ================================================================= //

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_ENDPOINT = `https://${domain}/api/2024-04/graphql.json`;

// --- vvvvv DEBUGGING LOGS vvvvv ---
console.log("--- Reading shopify.ts file ---");
console.log("Connecting to Shopify API Endpoint:", SHOPIFY_API_ENDPOINT);
// --- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ---

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ data: T; errors: any[] | null }> {
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
    console.error("Shopify Errors:", JSON.stringify(result.errors, null, 2));
  }
  
  return { data: result.data, errors: result.errors || null };
}

// ================================================================= //
//                      EXPORTED HELPER FUNCTIONS                    //
// ================================================================= //

// --- Product, Collection, and Search Functions ---

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
  const { data } = await shopifyFetch<ProductsAPIResponse>({ query });
  return data.products.edges.map(edge => edge.node);
}

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
  const { data } = await shopifyFetch<ProductByHandleAPIResponse>({ 
    query, 
    variables: { handle } 
  });
  return data.product;
}

export async function getProductsInCollection(collectionHandle: string): Promise<Product[]> {
  const query = `
    query getProductsInCollection($handle: String!) {
      collection(handle: $handle) {
        products(first: 10) {
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

  const { data } = await shopifyFetch<ResponseType>({ 
    query, 
    variables: { handle: collectionHandle } 
  });

  return data.collection?.products?.edges.map(edge => edge.node) || [];
}

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
    const { data } = await shopifyFetch<{ products: { edges: { node: Product }[] } | null }>({ 
      query,
      variables
    });
    
    if (!data.products?.edges) {
      console.log("Shopify search returned no products or a null response.");
      return [];
    }
    
    return data.products.edges.map(edge => edge.node);

  } catch (error) {
    console.error("Error in searchProducts function:", error);
    return [];
  }
}

// ================================================================= //
//                      CUSTOMER ACCOUNT FUNCTIONS (REDIRECT METHOD) //
// ================================================================= //

/**
 * Redirects the user to Shopify's built-in login page with email code authentication
 * This is the simplest and most reliable method for the new Customer Account API
 */
export function redirectToShopifyLogin() {
  // Add return_to parameter to redirect back to your site after login
  const returnUrl = encodeURIComponent(`http://localhost:3000/profile`);
  window.location.href = `https://${domain}/account/login?return_to=${returnUrl}`;
}

/**
 * Redirects the user to Shopify's account page (for logged-in users)
 */
export function redirectToShopifyAccount() {
  window.location.href = `https://${domain}/account`;
}

/**
 * Redirects the user to Shopify's logout page
 */
export function redirectToShopifyLogout() {
  const returnUrl = encodeURIComponent(`http://localhost:3000/`);
  window.location.href = `https://${domain}/account/logout?return_to=${returnUrl}`;
}

/**
 * Check if the user is logged in by trying to fetch customer data
 * This function is kept for backward compatibility but will likely fail
 * with the new Customer Account API since tokens are handled by Shopify
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
  
  try {
    const { data } = await shopifyFetch<CustomerAPIResponse>({ 
      query, 
      variables: { customerAccessToken } 
    });

    if (!data.customer) {
      return null; // Token is invalid or expired
    }
    
    const { orders, ...customerDetails } = data.customer;
    const customerOrders = orders.edges.map(edge => edge.node);

    return {
      customer: customerDetails,
      orders: customerOrders,
    };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return null;
  }
}