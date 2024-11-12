"use client";

import { Button } from "@/app/_components/ui/button";
import Markdown from "react-markdown";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { BotIcon, Loader2Icon } from "lucide-react";
import { generateAiReport } from "../_actions/generate-ai-report";
import { useState } from "react";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import "jspdf-autotable";



interface AiReportButtonProps {
  month: string;
}

const AiReportButton = ({ month }: AiReportButtonProps) => {
  const [reportIsLoading, setReportIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  
  const handleGenerateReportClick = async () => {
    try {
      setReportIsLoading(true);
      const report = await generateAiReport(month);
      setReport(report);
    } catch (error) {
      console.error(error);
    } finally {
      setReportIsLoading(false);
    }
  };
  
  // Função para gerar o PDF e fazer o download  // Função para gerar o PDF e fazer o download
  const handleDownloadPdf = () => {
    if (!report) return;

    const doc = new jsPDF('p', 'mm', 'a4'); // Configura a página para A4 no formato retrato (p)

    // Adiciona o título do relatório
    doc.setFontSize(18);
    doc.text('Relatório Gerado pela IA', 20, 20);
    
    // Adiciona o conteúdo do relatório
    doc.setFontSize(12);
    
    // Divide o texto em várias linhas com base na largura máxima
    const lines = doc.splitTextToSize(report, 180);  // Ajuste a largura para 180mm para caber na página A4
    
    // Ajusta a posição inicial para o conteúdo (Logo abaixo do título)
    let yPosition = 30;
    
    // Adiciona cada linha do texto com es       paçamento entre as linhas
    lines.forEach((line: string) => {
      if (yPosition + 10 > 280) {  // Verifica se a linha vai ultrapassar a parte inferior da página
        doc.addPage();  // Adiciona uma nova página
        yPosition = 15;  // Reseta a posição para o topo da nova página
      }
    
      doc.text(line, 20, yPosition); // Adiciona o texto na posição atual
      yPosition += 8;  // Ajuste o espaçamento entre as linhas (10mm por linha)
    });
    // Salva o PDF
    doc.save('relatorio-ia.pdf');
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="font-bold">
            <BotIcon />
            Relatório IA
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Relatório com IA</DialogTitle>
            <DialogDescription>
              Use inteligência artificial para gerar um relatório com insights
              sobre suas finanças.
            </DialogDescription>
          </DialogHeader>
          {report && (
            <ScrollArea className="prose prose-slate max-h-[450px] text-white marker:text-white prose-h3:text-white prose-h4:text-white prose-strong:text-white">
              <Markdown remarkPlugins={[remarkGfm]}>{report}</Markdown>
            </ScrollArea>
          )}
          <DialogFooter>
            <DialogClose>
              <Button variant="ghost" className="font-bold">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleGenerateReportClick}
              disabled={reportIsLoading}
              className="font-bold"
            >
              {reportIsLoading && <Loader2Icon className="mr-1 animate-spin" />}
              {reportIsLoading ? "Gerando relatório..." : "Gerar relatório"}
            </Button>
            {report && (
              <Button
                onClick={handleDownloadPdf}
                className="font-bold"
                variant="outline"
              >
                Baixar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiReportButton;
