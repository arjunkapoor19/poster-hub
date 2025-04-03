import { JSX, useState } from "react"
import { ChevronDown } from "lucide-react"

type DropdownItemProps = {
  title: string
  content: string
  icon: JSX.Element
}

const DropdownItem = ({ title, content, icon }: DropdownItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b py-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-lg font-medium">{title}</span>
        </div>
        <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && <p className="mt-2 text-gray-600 text-sm">{content}</p>}
    </div>
  )
}

export default function DropdownProducts({ description }: { description: string }) {
  return (
    <div className="max-w-lg mx-auto">
      <DropdownItem
        title="Product Description"
        content={description}
        icon={<span>📋</span>}
      />
      <DropdownItem
        title="Packaging Details"
        content="Transform any room with this high-quality poster, designed to add personality and style to your space. Printed on premium, fade-resistant paper, this artwork delivers vibrant colors and sharp details, making it the perfect statement piece for your home, office, or studio."
        icon={<span>📦</span>}
      />
      <DropdownItem
        title="Shipping & Processing: Fast & Free Prepaid Delivery"
        content="Transform any room with this high-quality poster, designed to add personality and style to your space. Printed on premium, fade-resistant paper, this artwork delivers vibrant colors and sharp details, making it the perfect statement piece for your home, office, or studio."
        icon={<span>🚚</span>}
      />
    </div>
  )
}
