import React from "react"
import { CheckCircle2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: 1, name: "Thông tin dịch vụ" },
    { id: 2, name: "Xác nhận" },
  ]

  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center min-w-[100px]">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id ? "border-green-500 bg-green-50 text-green-500" : "border-gray-300 text-gray-400"
              } transition-colors duration-300`}
              aria-label={`Bước ${step.id}: ${step.name}`}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 fill-white" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium text-center ${
                currentStep >= step.id ? "text-green-500" : "text-gray-500"
              }`}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                currentStep > index + 1 ? "bg-green-500" : "bg-gray-300"
              } transition-colors duration-300`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}