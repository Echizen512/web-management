import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import {
  Chart,
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";

import { DailyProduction } from "@/api/dailyProductionService";
import { Product } from "@/api/productService";
import { Measure } from "@/api/measureService";

Chart.register(
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Filler
);

const MONTHS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DC2626",
  "#059669",
  "#EA580C",
  "#0891B2",
  "#DB2777",
  "#65A30D",
  "#9333EA",
  "#0F766E",
  "#F59E0B",
  "#334155",
];

const getMonthLabel = (date: string) =>
  MONTHS[new Date(date).getMonth()];

interface ExportDailyProductionReportsProps {
  dailyData: DailyProduction[];
  yearlyData: DailyProduction[];
  products: Product[];
  measures: Measure[];
  selectedDate: string;
}

const formatDate = (
  date: string
) => {

  const d =
    new Date(date);

  const day =
    String(
      d.getDate()
    ).padStart(2, "0");

  const month =
    String(
      d.getMonth() + 1
    ).padStart(2, "0");

  const year =
    d.getFullYear();

  return `${day}/${month}/${year}`;
};

const HEADER_FILL = "FF1E293B";
const HEADER_TEXT = "FFFFFFFF";
const BORDER = "FFD6DCE5";

const createHeaderStyle =
  (): Partial<ExcelJS.Style> => ({
    font: {
      bold: true,
      color: {
        argb: HEADER_TEXT,
      },
      size: 11,
    },

    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: HEADER_FILL,
      },
    },

    alignment: {
      horizontal: "center",
      vertical: "middle",
    },

    border: {
      top: {
        style: "thin",
        color: { argb: BORDER },
      },

      bottom: {
        style: "thin",
        color: { argb: BORDER },
      },

      left: {
        style: "thin",
        color: { argb: BORDER },
      },

      right: {
        style: "thin",
        color: { argb: BORDER },
      },
    },
  });

const createCellStyle = (
  even: boolean
): Partial<ExcelJS.Style> => ({
  font: {
    size: 10,
    color: {
      argb: "FF111827",
    },
  },

  fill: {
    type: "pattern",
    pattern: "solid",

    fgColor: {
      argb: even
        ? "FFF8FAFC"
        : "FFFFFFFF",
    },
  },

  alignment: {
    horizontal: "center",
    vertical: "middle",
  },

  border: {
    top: {
      style: "thin",
      color: { argb: BORDER },
    },

    bottom: {
      style: "thin",
      color: { argb: BORDER },
    },

    left: {
      style: "thin",
      color: { argb: BORDER },
    },

    right: {
      style: "thin",
      color: { argb: BORDER },
    },
  },
});

const createTitle = (
  sheet: ExcelJS.Worksheet,
  title: string,
  subtitle: string
) => {
  sheet.mergeCells("A1:H1");

  sheet.getCell("A1").value =
    title;

  sheet.getCell("A1").font = {
    bold: true,
    size: 20,
    color: {
      argb: "FF0F172A",
    },
  };

  sheet.getCell("A1").alignment = {
    horizontal: "left",
  };

  sheet.mergeCells("A2:H2");

  sheet.getCell("A2").value =
    subtitle;

  sheet.getCell("A2").font = {
    italic: true,
    size: 11,
    color: {
      argb: "FF64748B",
    },
  };
};

const autoFit = (
  sheet: ExcelJS.Worksheet
) => {
  sheet.columns.forEach((column) => {
    let max = 14;

    column.eachCell?.(
      { includeEmpty: true },
      (cell) => {
        const len = String(
          cell.value || ""
        ).length;

        if (len > max) {
          max = len;
        }
      }
    );

    column.width = max + 5;
  });
};

/* =========================================
   CHART IMAGE
========================================= */

const createChartImage = async (
  config: any,
  width = 1000,
  height = 450
): Promise<string> => {
  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "No se pudo crear canvas"
    );
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  new Chart(ctx, config);

  await new Promise((r) =>
    setTimeout(r, 500)
  );

  return canvas.toDataURL(
    "image/png"
  );
};

/* =========================================
   EXPORTADOR
========================================= */

export const exportDailyProductionReports =
  async ({
    dailyData,
    yearlyData,
    products,
    measures,
    selectedDate,
  }: ExportDailyProductionReportsProps) => {

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "Sistema Producción";

    workbook.created =
      new Date();

    /* =========================================
       PRODUCCION DEL DIA
    ========================================= */

    const productTotals: Record<string, number> = {};

    /* =========================================
       FILTRAR SOLO LA FECHA SELECCIONADA
    ========================================= */

    const filteredDailyData =
      dailyData.filter((item) => {

        const itemDate =
          item.date.split("T")[0];

        return (
          itemDate === selectedDate
        );
      });

    console.log({
      selectedDate,
      dailyData,
      filteredDailyData,
    });

    /* =========================================
       ACUMULAR SOLO PRODUCCION DEL DIA
    ========================================= */

    filteredDailyData.forEach((item) => {

      const productName =
        products.find(
          (p) =>
            p.productID ===
            item.productID
        )?.name || "N/A";

      productTotals[
        productName
      ] =
        (
          productTotals[
          productName
          ] || 0
        ) + Number(item.quantity);

    });

    /* =========================================
       PIE CHART
    ========================================= */

    const pieImage =
      await createChartImage({

        type: "pie",

        data: {

          labels:
            Object.keys(
              productTotals
            ),

          datasets: [
            {
              data:
                Object.values(
                  productTotals
                ),

              backgroundColor:
                COLORS,

              borderColor:
                "#FFFFFF",

              borderWidth: 3,
            },
          ],
        },

        options: {

          responsive: false,

          plugins: {

            legend: {
              position: "bottom",
              labels: {
                color: "#111827",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
            },
          },
        },
      });

    /* =========================================
       GRAFICO MEDIDAS
    ========================================= */

    const measuresImage =
      await createChartImage({

        type: "line",

        data: {

          labels: MONTHS,

          datasets:
            measures.map(
              (measure, index) => ({

                label:
                  measure.name,

                data:
                  MONTHS.map(
                    (month) => {

                      return yearlyData
                        .filter(
                          (
                            item
                          ) =>
                            getMonthLabel(
                              item.date
                            ) ===
                            month &&
                            item.measureID ===
                            measure.measureID
                        )
                        .reduce(
                          (
                            acc,
                            curr
                          ) =>
                            acc +
                            Number(
                              curr.quantity
                            ),
                          0
                        );
                    }
                  ),

                borderColor:
                  COLORS[
                  index %
                  COLORS.length
                  ],

                backgroundColor:
                  COLORS[
                  index %
                  COLORS.length
                  ],

                tension: 0.4,

                borderWidth: 3,

                pointRadius: 4,

                fill: false,
              })
            ),
        },

        options: {

          responsive: false,

          plugins: {

            legend: {
              position: "bottom",
            },
          },

          scales: {

            y: {
              beginAtZero: true,
            },
          },
        },
      });

    /* =========================================
       GRAFICO MODELOS
    ========================================= */

    const modelsImage =
      await createChartImage({

        type: "line",

        data: {

          labels: MONTHS,

          datasets:
            products.map(
              (product, index) => ({

                label:
                  product.name,

                data:
                  MONTHS.map(
                    (month) => {

                      return yearlyData
                        .filter(
                          (
                            item
                          ) =>
                            getMonthLabel(
                              item.date
                            ) ===
                            month &&
                            item.productID ===
                            product.productID
                        )
                        .reduce(
                          (
                            acc,
                            curr
                          ) =>
                            acc +
                            Number(
                              curr.quantity
                            ),
                          0
                        );
                    }
                  ),

                borderColor:
                  COLORS[
                  index %
                  COLORS.length
                  ],

                backgroundColor:
                  COLORS[
                  index %
                  COLORS.length
                  ],

                tension: 0.4,

                borderWidth: 3,

                pointRadius: 4,

                fill: false,
              })
            ),
        },

        options: {

          responsive: false,

          plugins: {

            legend: {
              position: "bottom",
            },
          },

          scales: {

            y: {
              beginAtZero: true,
            },
          },
        },
      });

    /* =========================================
       HOJA 1
    ========================================= */

    const sheet1 =
      workbook.addWorksheet(
        "Producción Día"
      );

    createTitle(
      sheet1,
      "PRODUCCIÓN DIARIA",
      `Fecha seleccionada: ${formatDate(selectedDate)}`
    );

    sheet1.columns = [
      { width: 40 },
      { width: 20 },
    ];

    const header1 =
      sheet1.getRow(5);

    header1.values = [
      "MODELO",
      "CANTIDAD",
    ];

    header1.height = 28;

    header1.eachCell((cell) => {
      cell.style =
        createHeaderStyle();
    });

    Object.entries(
      productTotals
    ).forEach(
      ([name, qty], index) => {

        const row =
          sheet1.addRow([
            name,
            qty,
          ]);

        row.height = 24;

        row.eachCell((cell) => {
          cell.style =
            createCellStyle(
              index % 2 === 0
            );
        });
      }
    );

    const dailyTotal =
      Object.values(
        productTotals
      ).reduce(
        (acc, curr) =>
          acc + curr,
        0
      );

    const totalRow1 =
      sheet1.addRow([
        "TOTAL",
        dailyTotal,
      ]);

    totalRow1.height = 28;
    totalRow1.eachCell((cell) => {
      cell.style =
        createHeaderStyle();
    });

    const pieImageId =
      workbook.addImage({
        base64: pieImage,
        extension: "png",
      });

    sheet1.addImage(
      pieImageId,
      {
        tl: {
          col: 3,
          row: 1,
        },

        ext: {
          width: 560,
          height: 320,
        },
      }
    );

    /* =========================================
       HOJA 2
    ========================================= */

    const sheet2 =
      workbook.addWorksheet(
        "Acumulado Medidas"
      );

    createTitle(
      sheet2,
      "ACUMULADO POR MEDIDAS",
      "Consolidado mensual anual"
    );

    const measuresImageId =
      workbook.addImage({
        base64: measuresImage,
        extension: "png",
      });

    sheet2.addImage(
      measuresImageId,
      {
        tl: {
          col: 0,
          row: 3,
        },

        ext: {
          width: 920,
          height: 420,
        },
      }
    );

    const measuresHeader =
      [
        "MES",
        ...measures.map(
          (m) => m.name
        ),
      ];

    const measuresHeaderRow =
      sheet2.getRow(28);

    measuresHeaderRow.values =
      measuresHeader;

    measuresHeaderRow.height =
      28;

    measuresHeaderRow.eachCell(
      (cell) => {
        cell.style =
          createHeaderStyle();
      }
    );

    MONTHS.forEach(
      (month, monthIndex) => {

        const values =
          measures.map(
            (measure) => {

              return yearlyData
                .filter(
                  (item) =>
                    getMonthLabel(
                      item.date
                    ) === month &&
                    item.measureID ===
                    measure.measureID
                )
                .reduce(
                  (
                    acc,
                    curr
                  ) =>
                    acc +
                    Number(
                      curr.quantity
                    ),
                  0
                );
            }
          );

        const row =
          sheet2.addRow([
            month,
            ...values,
          ]);

        row.height = 24;

        row.eachCell((cell) => {
          cell.style =
            createCellStyle(
              monthIndex % 2 === 0
            );
        });
      }
    );

    const measuresTotals =
      measures.map(
        (measure) => {

          return yearlyData
            .filter(
              (item) =>
                item.measureID ===
                measure.measureID
            )
            .reduce(
              (
                acc,
                curr
              ) =>
                acc +
                Number(
                  curr.quantity
                ),
              0
            );
        }
      );

    const totalMeasuresRow =
      sheet2.addRow([
        "TOTAL",
        ...measuresTotals,
      ]);
    totalMeasuresRow.height =
      28;
    totalMeasuresRow.eachCell(
      (cell) => {
        cell.style =
          createHeaderStyle();
      }
    );



    const sheet3 =
      workbook.addWorksheet(
        "Acumulado Modelos"
      );

    createTitle(
      sheet3,
      "ACUMULADO POR MODELOS",
      "Consolidado mensual anual"
    );

    const modelsImageId =
      workbook.addImage({
        base64: modelsImage,
        extension: "png",
      });

    sheet3.addImage(
      modelsImageId,
      {
        tl: {
          col: 0,
          row: 3,
        },

        ext: {
          width: 920,
          height: 420,
        },
      }
    );

    const productsHeader =
      [
        "MES",
        ...products.map(
          (p) => p.name
        ),
      ];

    const productsHeaderRow =
      sheet3.getRow(28);

    productsHeaderRow.values =
      productsHeader;

    productsHeaderRow.height =
      28;

    productsHeaderRow.eachCell(
      (cell) => {
        cell.style =
          createHeaderStyle();
      }
    );

    MONTHS.forEach(
      (month, monthIndex) => {

        const values =
          products.map(
            (product) => {

              return yearlyData
                .filter(
                  (item) =>
                    getMonthLabel(
                      item.date
                    ) === month &&
                    item.productID ===
                    product.productID
                )
                .reduce(
                  (
                    acc,
                    curr
                  ) =>
                    acc +
                    Number(
                      curr.quantity
                    ),
                  0
                );
            }
          );

        const row =
          sheet3.addRow([
            month,
            ...values,
          ]);

        row.height = 24;

        row.eachCell((cell) => {
          cell.style =
            createCellStyle(
              monthIndex % 2 === 0
            );
        });
      }
    );

    const productsTotals =
      products.map(
        (product) => {

          return yearlyData
            .filter(
              (item) =>
                item.productID ===
                product.productID
            )
            .reduce(
              (
                acc,
                curr
              ) =>
                acc +
                Number(
                  curr.quantity
                ),
              0
            );
        }
      );

    const totalProductsRow =
      sheet3.addRow([
        "TOTAL",
        ...productsTotals,
      ]);
    totalProductsRow.height =
      28;
    totalProductsRow.eachCell(
      (cell) => {
        cell.style =
          createHeaderStyle();
      }
    );

    /* =========================================
       AJUSTES
    ========================================= */

    [
      sheet1,
      sheet2,
      sheet3,
    ].forEach((sheet) => {

      autoFit(sheet);

      sheet.views = [
        {
          state: "frozen",
          ySplit: 5,
        },
      ];
    });

    /* =========================================
       EXPORTAR
    ========================================= */

    const buffer =
      await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      `Reporte_Produccion_${selectedDate}.xlsx`
    );
  };