import PaymentForm from "@/components/payment-form";
import GradientBackground from "@/components/gradient-background";

export default function Home() {
  return (
    <main className="flex flex-col pt-24 pb-10">
      <GradientBackground />

      <div className="flex-1 flex items-center justify-center">
        <div className="z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
              Flouci Payment API Demo
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl">
              A simple, elegant interface to test the Flouci payment gateway.
              Enter an amount in Euros below to generate a payment link.
            </p>
          </div>

          <div className="w-full max-w-md">
            <PaymentForm />
          </div>
        </div>
      </div>
    </main>
  );
}
