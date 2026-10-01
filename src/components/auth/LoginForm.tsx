import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  onGoogleClick: () => Promise<void> | void;
  isSubmitting?: boolean;
  isGoogleLoading?: boolean;
  submitError?: string;
  successMessage?: string;
}

export function LoginForm({
  onSubmit,
  onGoogleClick,
  isSubmitting = false,
  isGoogleLoading = false,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("email")}
        type="email"
        label="Correo electrónico"
        placeholder="tu@duelup.com"
        error={errors.email?.message}
      />

      <PasswordInput
        {...register("password")}
        label="Contraseña"
        placeholder="••••••••"
        error={errors.password?.message}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        {isSubmitting ? 'Iniciando' : 'Iniciar'} sesión
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/40" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-white">
          <span className="bg-transparent px-2">o</span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onGoogleClick}
        isLoading={isGoogleLoading}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
            />
            <path
              fill="#34A853"
              d="M12 21.96c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.96Z"
            />
            <path
              fill="#FBBC05"
              d="M6.54 14.03a5.86 5.86 0 0 1 0-3.74V7.76H3.29a9.99 9.99 0 0 0 0 8.8l3.25-2.53Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.26c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.38 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.26l3.25 2.53C7.31 7.98 9.46 6.26 12 6.26Z"
            />
          </svg>
          <p>Continuar con Google</p>
        </div>
      </Button>

      <p className="text-center text-sm text-white-muted">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-purple hover:text-purple/80"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}
