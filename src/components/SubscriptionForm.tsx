"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaCreditCard } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/price";

function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcCheckDigit = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
      sum += parseInt(base.charAt(i), 10) * (factor - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const baseNine = digits.substring(0, 9);
  const d1 = calcCheckDigit(baseNine, 10);
  const d2 = calcCheckDigit(baseNine + d1.toString(), 11);

  return digits === baseNine + d1.toString() + d2.toString();
}

function isValidCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcCheckDigit = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
      sum += parseInt(base.charAt(i), 10) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const baseTwelve = digits.substring(0, 12);
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcCheckDigit(baseTwelve, weights1);
  const d2 = calcCheckDigit(baseTwelve + d1.toString(), weights2);

  return digits === baseTwelve + d1.toString() + d2.toString();
}

// Centralized validation rules
const VALIDATION_RULES = {
  cardNumber: {
    min: 19, // 16 digits + 3 spaces (#### #### #### ####)
    max: 19,
    error: {
      min: "Número do cartão deve ter 16 dígitos",
      max: "Número do cartão deve ter no máximo 16 dígitos",
      invalid: "Número do cartão inválido",
    },
  },
  expiry: {
    min: 5, // MM/AA
    max: 5,
    error: "Data de validade inválida (MM/AA)",
  },
  cvv: {
    min: 3,
    max: 3,
    error: "CVV deve ter 3 dígitos",
  },
  cpf: {
    min: 14, // 11 digits + formatting (###.###.###-##)
    max: 14,
    error: {
      min: "CPF deve ter 11 dígitos",
      invalid: "CPF inválido",
    },
  },
  cnpj: {
    min: 18, // 14 digits + formatting (##.###.###/####-##)
    max: 18,
    error: {
      min: "CNPJ deve ter 14 dígitos",
      invalid: "CNPJ inválido",
    },
  },
};

// Helper function to validate expiry date
const isValidExpiry = (expiry: string): boolean => {
  const [monthStr, yearStr] = expiry.split("/");
  if (!monthStr || !yearStr) return false;

  const month = parseInt(monthStr, 10);
  const year = 2000 + parseInt(yearStr, 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
};

const cardSchema = z.object({
  holderName: z.string().min(1, "Informe o nome do titular"),
  email: z.string().email("E-mail inválido"),
  firstName: z.string().min(2, "Obrigatório"),
  lastName: z.string().min(2, "Obrigatório"),
  cardNumber: z
    .string()
    .min(VALIDATION_RULES.cardNumber.min, VALIDATION_RULES.cardNumber.error.min)
    .max(VALIDATION_RULES.cardNumber.max, VALIDATION_RULES.cardNumber.error.max)
    .refine(
      (val) => /^\d{4} \d{4} \d{4} \d{4}$/.test(val),
      VALIDATION_RULES.cardNumber.error.invalid,
    ),
  expiry: z
    .string()
    .length(VALIDATION_RULES.expiry.min, VALIDATION_RULES.expiry.error)
    .refine(
      (val) => /^\d{2}\/\d{2}$/.test(val) && isValidExpiry(val),
      "Data de validade inválida ou expirada",
    ),
  cvv: z
    .string()
    .min(VALIDATION_RULES.cvv.min, VALIDATION_RULES.cvv.error)
    .max(VALIDATION_RULES.cvv.max, VALIDATION_RULES.cvv.error)
    .refine((val) => /^\d{3,4}$/.test(val), "CVV inválido"),
  documentType: z.enum(["CPF", "CNPJ"]),
  document: z.string().superRefine((val, ctx) => {
    // @ts-ignore - parent exists at runtime but not in type definition
    const documentType = ctx.parent?.documentType;
    const digitsOnly = val.replace(/\D/g, "");

    if (documentType === "CPF") {
      const requiredLength = 11;
      if (digitsOnly.length < requiredLength) {
        // Não mostrar erro enquanto está digitando, apenas quando estiver completo
        if (digitsOnly.length === 0) {
          // Campo vazio - não validar ainda
          return;
        }
        // Só mostrar erro se o campo estiver completo (com máscara)
        if (val.length === VALIDATION_RULES.cpf.min) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: VALIDATION_RULES.cpf.min,
            type: "string",
            inclusive: true,
            message: VALIDATION_RULES.cpf.error.min,
            origin: "string",
          });
        }
      } else if (digitsOnly.length === requiredLength && !isValidCpf(val)) {
        // Validar apenas quando tiver o tamanho completo
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_RULES.cpf.error.invalid,
        });
      }
    } else if (documentType === "CNPJ") {
      const requiredLength = 14;
      if (digitsOnly.length < requiredLength) {
        // Não mostrar erro enquanto está digitando, apenas quando estiver completo
        if (digitsOnly.length === 0) {
          // Campo vazio - não validar ainda
          return;
        }
        // Só mostrar erro se o campo estiver completo (com máscara)
        if (val.length === VALIDATION_RULES.cnpj.min) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: VALIDATION_RULES.cnpj.min,
            type: "string",
            inclusive: true,
            message: VALIDATION_RULES.cnpj.error.min,
            origin: "string",
          });
        }
      } else if (digitsOnly.length === requiredLength && !isValidCnpj(val)) {
        // Validar apenas quando tiver o tamanho completo
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_RULES.cnpj.error.invalid,
        });
      }
    }
  }),
});

export interface CartItem {
  id: string;
  type: "course";
  title: string;
  price: number;
}

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SessionData {
  user?: UserSession;
  status: "authenticated" | "unauthenticated" | "loading";
}

interface SubscriptionFormProps {
  amount: number;
  items: CartItem[];
  subscriptionPlanId?: string;
  period?: "MONTHLY" | "YEARLY";
}

export function SubscriptionForm({
  amount,
  items,
  subscriptionPlanId,
  period,
}: SubscriptionFormProps) {
  const { data: session } = useSession() as { data: SessionData | null };
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    mode: "onChange",
    defaultValues: {
      documentType: "CPF",
      email: session?.user?.email || "",
      holderName: session?.user?.name || "",
    },
  });

  const documentType = watch("documentType");

  function maskCpf(value: string) {
    let v = value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
  }

  function maskCnpj(value: string) {
    let v = value.replace(/\D/g, "");
    v = v.replace(/(\d{2})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1/$2");
    v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    return v;
  }

  function maskCardNumber(value: string) {
    const v = value.replace(/\D/g, "");
    const groups = v.match(/\d{1,4}/g);
    return groups ? groups.join(" ") : "";
  }

  function maskExpiry(value: string) {
    let v = value.replace(/\D/g, "");
    v = v.replace(/(\d{2})(\d{1,2})$/, "$1/$2");
    return v;
  }

  // Format and validate card number
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  // Format and validate expiry date
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  // Format and validate CVV
  const formatCVV = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  async function onSubmitCard(data: z.infer<typeof cardSchema>) {
    if (!session?.user?.id) {
      toast.error("Você precisa estar logado para finalizar a compra");
      return;
    }

    // @ts-ignore
    if (!window.MercadoPago) {
      toast.error(
        "SDK do Mercado Pago não carregado. Por favor, recarregue a página.",
      );
      return;
    }

    // Inicializa a SDK v2 (Idealmente isso ficaria fora da função, mas mantive aqui para facilitar)
    // @ts-ignore
    const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);

    setProcessing(true);

    const fullName = `${data.firstName} ${data.lastName}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    try {
      const cardNumberClean = data.cardNumber.replace(/\s/g, "");
      const [expiryMonth, expiryYear] = data.expiry.split("/");
      const expiryYearFull = `20${expiryYear}`;
      const cpfClean = data.document.replace(/\D/g, "");

      const tokenResponse = await mp.createCardToken({
        cardNumber: cardNumberClean,
        cardholderName: fullName,
        cardExpirationMonth: expiryMonth,
        cardExpirationYear: expiryYearFull,
        securityCode: data.cvv,
        identificationType: data.documentType,
        identificationNumber: cpfClean,
      });

      if (!tokenResponse.id) {
        throw new Error(
          "Erro ao gerar o token do cartão. Verifique se os dados estão corretos.",
        );
      }

      const token = tokenResponse.id;

      // 3. IDENTIFICAÇÃO DO MEIO DE PAGAMENTO (Para enviar ao backend)
      // Na v2, buscamos pelo BIN para saber se é 'visa', 'mastercard', etc.
      const bin = cardNumberClean.substring(0, 6);
      const paymentMethods = await mp.getPaymentMethods({ bin });
      const paymentMethodId = paymentMethods.results?.[0]?.id || "credit_card";

      // Device ID para Antifraude
      // @ts-ignore
      const deviceId = window.MP_DEVICE_SESSION_ID || "";

      const subscriptionResponse = await fetch(
        "/api/mercado-pago/subscription/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-meli-session-id": deviceId,
          },
          body: JSON.stringify({
            token: token,
            method: paymentMethodId,
            installments: 1,
            payer: {
              email: data.email,
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              cpf: cpfClean,
            },
            userId: session.user.id,
            items: items.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              quantity: 1,
            })),
            total: amount,
            subscriptionPlanId: subscriptionPlanId,
            frequencyType: "months",
            frequency: period === "YEARLY" ? 12 : 1,
            cardData: {
              lastFour: cardNumberClean.slice(-4),
              holderName: fullName,
              expiryMonth: expiryMonth,
              expiryYear: expiryYear,
              brand: paymentMethodId,
            },
          }),
        },
      );

      const subscriptionResult = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionResult.error || "Erro ao criar assinatura");
      }

      // 5. TRATAMENTO DO RESULTADO
      if (
        subscriptionResult.status === "authorized" ||
        subscriptionResult.status === "active"
      ) {
        toast.success(
          "Assinatura confirmada! Bem-vindo(a) ao Francês com Clara.",
        );
        router.push(`/assinar/sucesso?payment_id=${subscriptionResult.id}`);
      } else if (subscriptionResult.init_point) {
        // Caso precise de redirecionamento (Checkout Pro/3DS)
        window.location.href = subscriptionResult.init_point;
      } else {
        toast.success("Assinatura em processamento!");
        router.push(`/assinar/sucesso?payment_id=${subscriptionResult.id}`);
      }
    } catch (error: any) {
      console.error("Erro no checkout:", error);
      toast.error(
        error.message || "Erro ao processar pagamento. Tente novamente.",
      );
    } finally {
      setProcessing(false);
    }
  }

  if (!amount) {
    return null;
  }

  return (
    <section className="space-y-4 pt-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-gray-900">Assinatura</h2>
        <p className="text-xs text-gray-500">
          Complete sua assinatura mensal. O pagamento será cobrado
          automaticamente todo mês.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitCard)}
        className="space-y-4 rounded-md"
      >
        <p className="text-xs text-gray-500">
          Valor total:{" "}
          <span className="font-semibold">{formatPrice(amount)}</span>
        </p>

        <div className="relative w-full">
          <input
            type="text"
            maxLength={19}
            onKeyDown={handleKeyDown}
            {...register("cardNumber", {
              onChange: (e) => {
                const masked = formatCardNumber(e.target.value);
                e.target.value = masked;
                trigger("cardNumber");
              },
            })}
            className={`peer h-10 w-full rounded-md border px-3 py-5 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.cardNumber ? "border-red-400" : ""}`}
            placeholder=" "
          />
          <label
            className={`pointer-events-none line-clamp-1 text-nowrap absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all duration-200 ease-in-out peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500 ${errors.cardNumber ? "text-red-400" : "text-gray-300"}`}
          >
            Número do cartão
          </label>
          {errors.cardNumber && (
            <span className="text-xs text-red-500">
              {errors.cardNumber.message}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative w-full">
            <input
              type="text"
              maxLength={5}
              onKeyDown={handleKeyDown}
              {...register("expiry", {
                onChange: (e) => {
                  const v = formatExpiry(e.target.value);
                  e.target.value = v;
                  setValue("expiry", v, { shouldValidate: true });
                },
              })}
              className={`peer h-10 w-full rounded-md border px-3 py-5 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.expiry ? "border-red-400" : ""}`}
              placeholder=" "
            />
            <label
              className={`pointer-events-none line-clamp-1 text-nowrap absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all duration-200 ease-in-out peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500 ${errors.expiry ? "text-red-400" : "text-gray-300"}`}
            >
              Validade (MM/AA)
            </label>
            {errors.expiry && (
              <span className="text-xs text-red-500">
                {errors.expiry.message}
              </span>
            )}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              maxLength={3}
              onKeyDown={handleKeyDown}
              {...register("cvv", {
                onChange: (e) => {
                  const v = formatCVV(e.target.value);
                  e.target.value = v;
                  trigger("cvv");
                },
              })}
              className={`peer h-10 w-full rounded-md border px-3 py-5 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.cvv ? "border-red-400" : ""}`}
              placeholder=" "
            />
            <label
              className={`pointer-events-none line-clamp-1 text-nowrap absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all duration-200 ease-in-out peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500 ${errors.cvv ? "text-red-400" : "text-gray-300"}`}
            >
              CVV
            </label>
            {errors.cvv && (
              <span className="text-xs text-red-500">{errors.cvv.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* CAMPO NOME */}
          <div className="relative w-full">
            <input
              type="text"
              {...register("firstName")}
              className={`peer h-10 w-full rounded-md border px-3 py-5 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.firstName ? "border-red-400" : ""}`}
              placeholder=" "
            />
            <label className="pointer-events-none absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500">
              Nome
            </label>
            {errors.firstName && (
              <span className="text-xs text-red-500">
                {errors.firstName.message as string}
              </span>
            )}
          </div>

          {/* CAMPO SOBRENOME */}
          <div className="relative w-full">
            <input
              type="text"
              {...register("lastName")}
              className={`peer h-10 w-full rounded-md border px-3 py-5 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.lastName ? "border-red-400" : ""}`}
              placeholder=" "
            />
            <label className="pointer-events-none absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500">
              Sobrenome
            </label>
            {errors.lastName && (
              <span className="text-xs text-red-500">
                {errors.lastName.message as string}
              </span>
            )}
          </div>
        </div>

        <div className="relative w-full">
          <input
            type="email"
            onKeyDown={handleKeyDown}
            {...register("email")}
            className={`peer h-10 w-full rounded-md border px-3 py-5 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.email ? "border-red-400" : ""}`}
            placeholder=" "
          />
          <label
            className={`pointer-events-none line-clamp-1 text-nowrap absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all duration-200 ease-in-out peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500 ${errors.email ? "text-red-400" : "text-gray-300"}`}
          >
            E-mail
          </label>
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative w-1/3">
            <select
              onKeyDown={handleKeyDown}
              {...register("documentType", {
                onChange: (e) => {
                  const value = e.target.value as "CPF" | "CNPJ";
                  // Limpar o input quando trocar de tipo
                  setValue("document", "", { shouldValidate: false });
                  // Limpar erros do documento anterior
                  trigger("document");
                },
              })}
              className={`peer h-10 w-full rounded-md border px-3 py-2 text-sm text-transparent outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.documentType ? "border-red-400" : ""}`}
            >
              <option value="CPF" className="text-black">
                CPF
              </option>
              <option value="CNPJ" className="text-black">
                CNPJ
              </option>
            </select>
            <div className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 text-xs text-black">
              {documentType}
            </div>
            <label
              className={`pointer-events-none absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all peer-focus:text-pink-500 ${errors.documentType ? "text-red-400" : "text-[#99A1AF]"}`}
            >
              Documento
            </label>
          </div>

          <div className="relative w-2/3">
            <input
              type="text"
              maxLength={documentType === "CPF" ? 14 : 18}
              onKeyDown={handleKeyDown}
              {...register("document", {
                onChange: (e) => {
                  const value = e.target.value;
                  let maskedValue = "";
                  if (documentType === "CPF") {
                    maskedValue = maskCpf(value);
                  } else {
                    maskedValue = maskCnpj(value);
                  }
                  e.target.value = maskedValue;

                  const digitsOnly = maskedValue.replace(/\D/g, "");
                  const requiredLength = documentType === "CPF" ? 11 : 14;
                  const isComplete = digitsOnly.length === requiredLength;

                  // Atualizar o valor
                  setValue("document", maskedValue, {
                    shouldValidate: false,
                  });

                  // Validar manualmente quando o campo estiver completo
                  if (isComplete) {
                    let isValid = false;
                    let errorMessage = "";

                    if (documentType === "CPF") {
                      isValid = isValidCpf(maskedValue);
                      if (!isValid) {
                        errorMessage = VALIDATION_RULES.cpf.error.invalid;
                      }
                    } else {
                      isValid = isValidCnpj(maskedValue);
                      if (!isValid) {
                        errorMessage = VALIDATION_RULES.cnpj.error.invalid;
                      }
                    }

                    if (!isValid) {
                      setError("document", {
                        type: "manual",
                        message: errorMessage,
                      });
                    } else {
                      clearErrors("document");
                    }
                  } else {
                    // Limpar erros enquanto está digitando
                    clearErrors("document");
                  }
                },
                onBlur: () => {
                  // Validar novamente ao sair do campo
                  const currentValue = watch("document");
                  if (currentValue) {
                    const digitsOnly = currentValue.replace(/\D/g, "");
                    const requiredLength = documentType === "CPF" ? 11 : 14;
                    if (digitsOnly.length === requiredLength) {
                      let isValid = false;
                      let errorMessage = "";

                      if (documentType === "CPF") {
                        isValid = isValidCpf(currentValue);
                        if (!isValid) {
                          errorMessage = VALIDATION_RULES.cpf.error.invalid;
                        }
                      } else {
                        isValid = isValidCnpj(currentValue);
                        if (!isValid) {
                          errorMessage = VALIDATION_RULES.cnpj.error.invalid;
                        }
                      }

                      if (!isValid) {
                        setError("document", {
                          type: "manual",
                          message: errorMessage,
                        });
                      } else {
                        clearErrors("document");
                      }
                    }
                  }
                },
              })}
              className={`peer h-10 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${errors.document ? "border-red-400" : ""}`}
              placeholder=" "
            />
            <label
              className={`pointer-events-none line-clamp-1 text-nowrap absolute left-3 top-[-0.7rem] bg-white p-0.5 text-xs transition-all duration-200 ease-in-out peer-placeholder-shown:top-[0.45rem] peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.7rem] peer-focus:text-xs peer-focus:text-pink-500 ${errors.document ? "text-red-400" : "text-gray-300"}`}
            >
              {documentType === "CPF" ? "CPF" : "CNPJ"}
            </label>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {(() => {
                  const currentValue = watch("document") || "";
                  const digitsOnly = currentValue.replace(/\D/g, "");
                  const requiredLength = documentType === "CPF" ? 11 : 14;
                  const currentLength = digitsOnly.length;
                  return `${currentLength}/${requiredLength} caracteres`;
                })()}
              </div>
              {errors.document && (
                <span className="text-xs text-red-500">
                  {errors.document.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="mt-2 cursor-pointer inline-flex w-full items-center justify-center rounded-md bg-linear-to-r from-clara-rose to-pink-500 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
        >
          {processing ? "Processando..." : "Assinar agora"}
        </button>
      </form>
    </section>
  );
}
