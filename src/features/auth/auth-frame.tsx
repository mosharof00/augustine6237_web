import Image from "next/image";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-sidebar lg:grid-cols-2">
      <div className="relative hidden min-h-svh lg:block">
        <Image
          src="/auth/hero.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
      <div className="flex min-h-svh items-center justify-center px-6 py-12 text-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
