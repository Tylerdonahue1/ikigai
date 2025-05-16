import { Button } from "@/components/ui/button"

interface PaymentButtonProps {
  id: string
  className?: string
  fullWidth?: boolean
}

export default function PaymentButton({ id, className, fullWidth = false }: PaymentButtonProps) {
  // Use UTM parameters for tracking
  const stripePaymentLink = `https://buy.stripe.com/6oE5nc17a6M2f5K4gg?client_reference_id=${id}&utm_source=ikigai&utm_medium=redirect&utm_campaign=fullreport&utm_content=${id}`

  return (
    <Button
      asChild
      className={`${fullWidth ? "w-full" : ""} ${className || "bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none"}`}
    >
      <a href={stripePaymentLink} target="_blank" rel="noopener noreferrer">
        Unlock Full Report ($29)
      </a>
    </Button>
  )
}

