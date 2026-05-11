'use client';

import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import _ from 'lodash';

interface RangeSliderWithChartsProps {
  min: number;
  max: number;
  start: [number, number];
  onChange: (values: [number, number]) => void;
}

export default function RangeSliderWithCharts({
  min,
  max,
  start,
  onChange,
}: RangeSliderWithChartsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const backgroundChartRef = useRef<HTMLDivElement>(null);
  const foregroundChartRef = useRef<HTMLDivElement>(null);
  const foregroundParentRef = useRef<HTMLDivElement>(null);
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);
  const sliderInstanceRef = useRef<any>(null);
  const backgroundChartInstanceRef = useRef<any>(null);
  const foregroundChartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!sliderRef.current || !backgroundChartRef.current || !foregroundChartRef.current || !foregroundParentRef.current) return;

    // Функция для обновления foreground графика
    const updateForegroundChart = (foregroundParent: HTMLElement, foreground: HTMLElement, values: number[]) => {
      const from = (100 * values[0]) / max;
      const to = (100 * values[1]) / max;
      const width = 100 - (from + (100 - to));
      
      foregroundParent.style.left = `${from}%`;
      foregroundParent.style.width = `${width}%`;
      foreground.style.width = `${foregroundParent.parentElement!.clientWidth}px`;
      foreground.style.marginLeft = `${-((foregroundParent.parentElement!.clientWidth / 100) * from)}px`;
    };

    // Создание background графика
    const backgroundChartOptions = {
      series: [{
        name: 'Sales',
        data: [21, 20, 24, 45, 47, 50, 60, 70, 80, 75, 65, 55, 50, 40, 30, 30, 35, 45, 50, 60, 70, 80, 75, 65, 55, 50, 40, 35, 40]
      }],
      chart: {
        height: 150,
        type: 'bar' as const,
        sparkline: {
          enabled: true
        }
      },
      colors: ['#e5e7eb'],
      plotOptions: {
        bar: {
          colors: {
            ranges: [{
              from: -45,
              to: 0,
              color: '#e5e7eb'
            }]
          }
        }
      },
      xaxis: {
        type: 'category' as const,
        crosshairs: {
          show: false
        }
      },
      states: {
        hover: {
          filter: {
            type: 'none' as const
          }
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'none' as const
          }
        }
      },
      tooltip: {
        enabled: false
      },
      grid: {
        borderColor: '#f3f4f6'
      }
    };

    backgroundChartInstanceRef.current = new ApexCharts(backgroundChartRef.current, backgroundChartOptions);
    backgroundChartInstanceRef.current.render();

    // Создание foreground графика
    const foregroundChartOptions = {
      series: [{
        name: 'Sales',
        data: [21, 20, 24, 45, 47, 50, 60, 70, 80, 75, 65, 55, 50, 40, 30, 30, 35, 45, 50, 60, 70, 80, 75, 65, 55, 50, 40, 35, 40]
      }],
      chart: {
        height: 150,
        type: 'bar' as const,
        sparkline: {
          enabled: true
        }
      },
      colors: ['#8b5cf6'],
      plotOptions: {
        bar: {
          colors: {
            ranges: [{
              from: -45,
              to: 0,
              color: '#8b5cf6'
            }]
          }
        }
      },
      xaxis: {
        type: 'category' as const,
        crosshairs: {
          show: false
        }
      },
      states: {
        hover: {
          filter: {
            type: 'none' as const
          }
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'none' as const
          }
        }
      },
      tooltip: {
        enabled: false
      },
      grid: {
        borderColor: '#f3f4f6'
      }
    };

    foregroundChartInstanceRef.current = new ApexCharts(foregroundChartRef.current, foregroundChartOptions);
    foregroundChartInstanceRef.current.render();

    // Создание range slider
    if (!sliderInstanceRef.current) {
      sliderInstanceRef.current = noUiSlider.create(sliderRef.current, {
        start: start,
        range: {
          min: min,
          max: max
        },
        connect: true,
        format: {
          to: (value: number) => Math.round(value),
          from: (value: string) => Number(value)
        }
      });

      // Обработчик изменения slider
      sliderInstanceRef.current.on('update', (values: string[]) => {
        const numValues = values.map(v => Number(v));
        if (minInputRef.current) minInputRef.current.value = numValues[0].toString();
        if (maxInputRef.current) maxInputRef.current.value = numValues[1].toString();
        updateForegroundChart(foregroundParentRef.current!, foregroundChartRef.current!, numValues);
        onChange([numValues[0], numValues[1]]);
      });
    }

    // Обработчики для input полей
    const handleMinInput = _.debounce((evt: Event) => {
      const target = evt.target as HTMLInputElement;
      const value = Number(target.value);
      if (maxInputRef.current) {
        sliderInstanceRef.current?.set([value, Number(maxInputRef.current.value)]);
      }
    }, 200);

    const handleMaxInput = _.debounce((evt: Event) => {
      const target = evt.target as HTMLInputElement;
      const value = Number(target.value);
      if (minInputRef.current) {
        sliderInstanceRef.current?.set([Number(minInputRef.current.value), value]);
      }
    }, 200);

    if (minInputRef.current) {
      minInputRef.current.addEventListener('input', handleMinInput);
    }
    if (maxInputRef.current) {
      maxInputRef.current.addEventListener('input', handleMaxInput);
    }

    // Обработчик resize
    const handleResize = () => {
      if (sliderInstanceRef.current && foregroundParentRef.current && foregroundChartRef.current) {
        const values = sliderInstanceRef.current.get().map((v: string) => Number(v));
        updateForegroundChart(foregroundParentRef.current, foregroundChartRef.current, values);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (sliderInstanceRef.current) {
        sliderInstanceRef.current.destroy();
        sliderInstanceRef.current = null;
      }
      if (backgroundChartInstanceRef.current) {
        backgroundChartInstanceRef.current.destroy();
      }
      if (foregroundChartInstanceRef.current) {
        foregroundChartInstanceRef.current.destroy();
      }
      if (minInputRef.current) {
        minInputRef.current.removeEventListener('input', handleMinInput);
      }
      if (maxInputRef.current) {
        maxInputRef.current.removeEventListener('input', handleMaxInput);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [min, max, start, onChange]);

  return (
    <div className="w-full">
      <label className="sr-only">Диапазон цены</label>
      
      {/* Background Chart */}
      <div className="relative">
        <div ref={backgroundChartRef} id="hs-range-with-charts-bar-chart-background"></div>
        
        {/* Foreground Chart Container */}
        <div className="absolute top-0 inset-s-0 size-full overflow-hidden">
          <div ref={foregroundParentRef} className="absolute top-0 inset-e-0 size-full overflow-hidden">
            <div ref={foregroundChartRef} id="hs-range-with-charts-bar-chart-foreground"></div>
          </div>
        </div>
      </div>

      {/* Range Slider */}
      <div 
        ref={sliderRef}
        className="mt-4"
        style={{
          height: '8px',
        }}
      />

      {/* Custom Range Inputs */}
      <div className="mt-5">
        <div className="text-sm font-medium mb-2 text-gray-900">Диапазон цены:</div>
        <div className="flex flex-row space-x-4">
          <div className="basis-1/2">
            <input
              ref={minInputRef}
              type="number"
              defaultValue={start[0]}
              className="py-2.5 sm:py-3 px-4 block w-full bg-gray-50 border-2 border-gray-200 rounded-lg sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500 disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
          <div className="basis-1/2">
            <input
              ref={maxInputRef}
              type="number"
              defaultValue={start[1]}
              className="py-2.5 sm:py-3 px-4 block w-full bg-gray-50 border-2 border-gray-200 rounded-lg sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500 disabled:opacity-50 disabled:pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
