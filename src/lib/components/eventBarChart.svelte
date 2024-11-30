<script lang="ts">
    import { Chart } from "chart.js/auto";
    import { onMount } from "svelte";
  
    let { data, barTitle, yTitle, xTitle } = $props();
    let chartInstance: Chart | null = null;
  
    function createChart() {
      const canvas = document.getElementById("eventsChart") as HTMLCanvasElement;
      if (!canvas) return;
  
      if (chartInstance) {
        chartInstance.destroy();
      }
  
      chartInstance = new Chart(canvas, {
        type: "bar",
        data: {
          labels: data.map((item: any) => item.event_type.toUpperCase()),
          datasets: [

            {
              label: 'Total Points',
              data: data.map((item: any) => item.total_score),
              backgroundColor: "rgb(245, 254, 253, 0.3)",
              borderColor: "rgb(255, 0, 51)",
              borderWidth: 2,
              barPercentage: 0.8,
              order: 1
            },
            {
              label: 'Number of Occurrences',
              data: data.map((item: any) => item.total_occurrences),
              backgroundColor: "rgba(75, 192, 192, 0.3)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 2,
              barPercentage: 0.8,
              order: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: barTitle,
              color: "#f5fefd",
              font: { size: 16 }
            },
            legend: {
              display: true,
              labels: {
                color: "#f5fefd"
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: xTitle,
                color: "#f5fefd"
              },
              ticks: {
                color: "#f5fefd"
              },
              grid: {
                display: false
              }
            },
            y: {
              title: {
                display: true,
                text: yTitle,
                color: "#f5fefd"
              },
              ticks: {
                color: "#f5fefd"
              },
              grid: {
                color: "rgba(255, 255, 255, 0.4)"
              }
            }
          }
        }
      });
    }
  
    onMount(() => {
      createChart();
    });
  </script>
  
  <div class="w-full flex h-fit bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <div class="w-48 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
          Engagement Scoring
        </h3>
        <ul class="space-y-2">
            <li class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-300">Play Track</span>
              <span class="font-medium text-gray-700 dark:text-gray-200">1 point</span>
            </li>
          <li class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-300">Like Track</span>
            <span class="font-medium text-gray-700 dark:text-gray-200">2 points</span>
          </li>
          <li class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-300">Add to Playlist</span>
            <span class="font-medium text-gray-700 dark:text-gray-200">2 points</span>
          </li>
          <li class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-300">Share Track</span>
            <span class="font-medium text-gray-700 dark:text-gray-200">3 points</span>
          </li>
        </ul>
      </div>
      <div class="flex-1 h-[65vh] w-fit" >
        <canvas id="eventsChart"></canvas>
      </div>
      </div>