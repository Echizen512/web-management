"use client";
import { useState } from "react";
import {
  FileText,
  Download,
  Loader2,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  PieChart,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getProducts } from "@/api/productService";
import { getMeasures } from "@/api/measureService";
import {
  getDailyProduction,
} from "@/api/dailyProductionService";
import {
  getRejectProducts,
} from "@/api/rejectProductService";
import {
  generateProductionReport,
} from "@/types/ExcelGenerator";
import {
  exportDailyProductionReports,
} from "@/utils/dailyProductionReports";
export function ExportPage() {
  const [isExporting, setIsExporting] =
    useState(false);
  const [isExportingCharts, setIsExportingCharts] =
    useState(false);
  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );
  const formatLocalDate = (
    date: Date
  ) => {
    const year =
      date.getFullYear();
    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");
    const day =
      String(
        date.getDate()
      ).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleExportProduction =
    async () => {
      try {
        setIsExporting(true);
        const current =
          new Date(
            selectedDate + "T00:00:00"
          );
        const dayOfWeek =
          current.getDay();
        const diff =
          current.getDate() -
          dayOfWeek +
          (dayOfWeek === 0 ? -6 : 1);
        const monday =
          new Date(
            new Date(current)
              .setDate(diff)
          );
        const sunday =
          new Date(
            new Date(monday)
              .setDate(
                monday.getDate() + 6
              )
          );
        const startDateStr =
          formatLocalDate(monday);
        const endDateStr =
          formatLocalDate(sunday);
        const firstDayMonth =
          new Date(
            current.getFullYear(),
            current.getMonth(),
            1
          );
        const lastDayMonth =
          new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            0
          );
        const monthStartStr =
          formatLocalDate(
            firstDayMonth
          );
        const monthEndStr =
          formatLocalDate(
            lastDayMonth
          );
        const firstDayYear =
          new Date(
            current.getFullYear(),
            0,
            1
          );
        const lastDayYear =
          new Date(
            current.getFullYear(),
            11,
            31
          );
        const yearStartStr =
          formatLocalDate(
            firstDayYear
          );
        const yearEndStr =
          formatLocalDate(
            lastDayYear
          );
        const [
          products,
          measures,
          dayData,
          weekData,
          monthData,
          yearData,
          dayReject,
          weekReject,
        ] = await Promise.all([
          getProducts(),
          getMeasures(),
          getDailyProduction(
            selectedDate,
            selectedDate
          ),
          getDailyProduction(
            startDateStr,
            endDateStr
          ),
          getDailyProduction(
            monthStartStr,
            monthEndStr
          ),
          getDailyProduction(
            yearStartStr,
            yearEndStr
          ),
          getRejectProducts(
            selectedDate,
            selectedDate
          ),
          getRejectProducts(
            startDateStr,
            endDateStr
          ),
        ]);
        let observations = "";
        if (
          Array.isArray(dayData?.data)
        ) {
          const observationRecord =
            dayData.data.find(
              (item: any) => {
                const itemDate =
                  (
                    item.date || ""
                  ).split("T")[0];
                return (
                  itemDate ===
                  selectedDate
                );
              }
            );
          observations =
            observationRecord?.observation || "";
        }
        const dataParaReporte = [
          {
            targetDate:
              selectedDate,
            dayProduction:
              dayData?.data || [],
            weekProduction:
              weekData?.data || [],
            monthProduction:
              monthData?.data || [],
            yearProduction:
              yearData?.data || [],
            dayRejects:
              dayReject || [],
            weekRejects:
              weekReject || [],
            observations,
          },
        ];
        await generateProductionReport(
          products,
          measures,
          dataParaReporte
        );
        toast.success(
          "Reporte generado exitosamente"
        );
      } catch (error: any) {
        console.error(error);
        toast.error(
          "Error al generar el reporte: " +
          (
            error.message ||
            "Error desconocido"
          )
        );
      } finally {
        setIsExporting(false);
      }
    };
  const handleExportCharts =
  async () => {
    try {

      setIsExportingCharts(true);

      const current =
        new Date(
          selectedDate + "T00:00:00"
        );

      const yearStart =
        formatLocalDate(
          new Date(
            current.getFullYear(),
            0,
            1
          )
        );

      const yearEnd =
        formatLocalDate(
          new Date(
            current.getFullYear(),
            11,
            31
          )
        );

      const [
        products,
        measures,

        // SOLO DÍA
        dailyProductionData,

        // TODO EL AÑO
        yearlyProductionData,

      ] = await Promise.all([

        getProducts(),

        getMeasures(),

        getDailyProduction(
          selectedDate,
          selectedDate
        ),

        getDailyProduction(
          yearStart,
          yearEnd
        ),

      ]);

      await exportDailyProductionReports({

        selectedDate,

        products,

        measures,

        dailyData:
          dailyProductionData?.data || [],

        yearlyData:
          yearlyProductionData?.data || [],

      });

      toast.success(
        "Reportes gráficos generados exitosamente"
      );

    } catch (error: any) {

      console.error(error);

      toast.error(
        "Error generando reportes gráficos"
      );

    } finally {

      setIsExportingCharts(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Centro de Reportes
        </h1>
        <p className="text-slate-500 font-medium">
          Genera documentos oficiales en formato Excel (.xlsx)
        </p>
      </div>
      <div className="bg-background border rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-200 p-3 rounded-2xl text-blue-600">
            <CalendarIcon size={28} />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
              Fecha del Reporte
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className="block w-full bg-transparent text-xl font-bold focus:outline-none cursor-pointer"
            />
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Estado del Servidor
          </p>
          <div className="flex items-center gap-2 text-green-500 justify-end">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-black uppercase">
              Conectado
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REPORTE GENERAL */}
        <div className="group bg-background border-2 rounded-[2.5rem] p-8 transition-all duration-300 shadow-sm hover:shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-900 text-white p-4 rounded-2xl group-hover:bg-blue-500 transition-colors">
              <FileText size={32} />
            </div>
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Disponible
            </div>
          </div>
          <h3 className="text-4xl font-extrabold mb-2">
            Producción Diaria
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            Genera la hoja de balance detallada por categorías con acumulados
            semanales, mensuales y anuales.
          </p>
          <Button
            onClick={
              handleExportProduction
            }
            disabled={isExporting}
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest gap-3 shadow-lg transition-all active:scale-95"
          >
            {
              isExporting
                ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={20}
                    />
                    Generando...
                  </>
                )
                : (
                  <>
                    <Download size={20} />
                    Descargar Excel
                  </>
                )
            }
          </Button>
        </div>
        {/* REPORTES GRÁFICOS */}
        <div className="group bg-background border-2 rounded-[2.5rem] p-8 transition-all duration-300 shadow-sm hover:shadow-xl border-blue-200">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-500 text-white p-4 rounded-2xl">
              <FileSpreadsheet size={32} />
            </div>
            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Nuevo
            </div>
          </div>
          <h3 className="text-3xl font-extrabold mb-3">
            Reportes Gráficos
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            Genera automáticamente gráficos en Excel usando los registros
            existentes de producción.
          </p>
          <Button
            onClick={
              handleExportCharts
            }
            disabled={
              isExportingCharts
            }
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest gap-3 shadow-lg transition-all active:scale-95"
          >
            {
              isExportingCharts
                ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={20}
                    />
                    Generando...
                  </>
                )
                : (
                  <>
                    <Download size={20} />
                    Descargar Reportes
                  </>
                )
            }
          </Button>
        </div>
      </div>
    </div>
  );
}