import { createSignal, createEffect, onCleanup } from "solid-js";
import Chart from "chart.js/auto";

// Define chartInstances object to store Chart instances
const chartInstances = {};

export default function LineChart({ property, data, class: additionalClass }) {
  const [canvasRef, setCanvasRef] = createSignal(null);

  onCleanup(() => {
    const canvas = canvasRef()?.[0];
    const ctx = canvas?.getContext("2d");

    const chartInstance = chartInstances[property];
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  createEffect(() => {
    const canvas = document.getElementById(`myCanvas_${property}`);
    const ctx = canvas.getContext("2d");

    if (chartInstances[property]) {
      chartInstances[property].destroy();
    }

    chartInstances[property] = new Chart(ctx, {
      type: "line",
      data: {
        labels: data().map((item) => item.timestamp),
        datasets: [
          {
            label: `${property}`,
            data: data().map((item) => item[property]),
            borderColor: "#FAA028",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontSize: 20,
          }
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            grid: {
              color: '#303030',
            },
            ticks: {
              callback: (value) => {
                const date = new Date(value);
                return `${date.toLocaleTimeString()}`;
              },
              max: 10,
              color: '#606060'
            },
          },
          y: {
            ticks: {
              color: '#606060',
            },
            grid: {
              color: '#505050',
            }
          }
        },
      },
    });

    return () => {
      chartInstances[property].destroy();
    };
  });

  return (
    <div class={`chart-container ${additionalClass}`}>
      <canvas ref={canvasRef} id={`myCanvas_${property}`} class='line-chart' width={2000} />
    </div>
  );
}
