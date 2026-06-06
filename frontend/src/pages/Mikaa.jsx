import React from "react";
import { PageHeader } from "@/components/ui-kit";
import { MikaaFullChat } from "@/components/Mikaa";
import { useMikaa } from "@/context/MikaaContext";
import { AlertCircle } from "lucide-react";

export default function Mikaa() {
  const { available } = useMikaa();

  return (
    <div>
      <PageHeader
        title="Mikaa 🌸"
        subtitle="Sua assistente IA — pergunte sobre preços, receitas, margens e gestão."
      />

      {available === false ? (
        <div className="bg-card border border-border rounded-3xl p-10 text-center">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-destructive/15 items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="heading-serif text-2xl">Mikaa indisponível</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            A variável de ambiente <code>GEMINI_API_KEY</code> não está configurada
            no backend. Configure no Koyeb para ativar a Mikaa.
          </p>
        </div>
      ) : (
        <MikaaFullChat />
      )}
    </div>
  );
}
