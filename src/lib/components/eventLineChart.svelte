<script lang="ts">
    import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";

  let { data } = $props();
  let chartInstance: Chart | null = null;
  let viewType = $state("hourly"); 
    
    
  function processData() {
    const eventData = new Map<string, number[]>();
    const eventTypes = ['like_track', 'add_track_to_playlist', 'play_track', 'share_track'];
    
    switch(viewType) {
    case "hourly":
      eventTypes.forEach(type => {
        eventData.set(type, Array(24).fill(0));
      });
      data.forEach((record: any) => {
        const hourData = eventData.get(record.event_type);
        const hour = parseInt(record.hour);
        if (hourData) {
          hourData[hour] += record.total_engagement;
        }
      });
      break;

    case "daily":
      eventTypes.forEach(type => {
        eventData.set(type, Array(7).fill(0));
      });
      data.forEach((record: any) => {
        const dayData = eventData.get(record.event_type);
        const day = parseInt(record.day_of_week);
        if (dayData) {
          dayData[day] += record.total_engagement;
        }
      });
      break;

    case "monthly":
      eventTypes.forEach(type => {
        eventData.set(type, Array(31).fill(0));
      });
      data.forEach((record: any) => {
        const monthData = eventData.get(record.event_type);
        const day = parseInt(record.month);
        if (monthData) {
          monthData[day - 1] += record.total_engagement;
        }
      });
      break;
  }
  
  return eventData;
}
  
    function createChart() {
      const canvas = document.getElementById("eventEngagementChart") as HTMLCanvasElement;
      if (!canvas) return;
  
      if (chartInstance) {
        chartInstance.destroy();
      }
  
      const eventData = processData();
      const labels = (() => {
    switch(viewType) {
      case "hourly":
        return Array.from({ length: 24 }, (_, i) => 
          `${i.toString().padStart(2, "0")}:00`);
      case "daily":
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      case "monthly":
        return Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);
      default:
        return [];
    }
  })();


      const colors: { [key: string]: string } = {
        'like_track': 'rgb(75, 192, 192)',
        'add_track_to_playlist': 'rgb(255, 99, 132)',
        'play_track': 'rgb(255, 205, 86)',
        'share_track': 'rgb(54, 162, 235)'
      };
  
      chartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: Array.from(eventData.entries()).map(([type, data]) => ({
            label: type.replace(/_/g, ' ').toUpperCase(),
            data: data,
            fill: true,
            backgroundColor: "transparent",
            borderColor: colors[type],
            tension: 0.4,
            pointRadius: 4,
            }))
      },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: viewType === "hourly" ? "Hours of Day" : 
              viewType === "daily" ? "Days of Week" : "Days of Month",              
              color: "#f5fefd",
              font: { size: 16 }
            },
            legend: {
              position: "top",
              labels: { color: "#f5fefd" }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: viewType === "hourly" ? "Hours" : 
                  viewType === "daily" ? "Days" : "Months",
                color: "#f5fefd"
              },
              ticks: { color: "#f5fefd" },
              grid: {
                color: "rgba(255, 255, 255, 0.1)"
              }
            },
            y: {
              title: {
                display: true,
                text: "Engagement Score",
                color: "#f5fefd"
              },
              ticks: { color: "#f5fefd" },
              beginAtZero: true,
              grid: {
                color: "rgba(255, 255, 255, 0.1)"
              }
            }
          }
        }
      });
    }
  
    onMount(() => {
    createChart();
  });

  $effect(() => {
    createChart();
  });
  </script>
  


  <div class="w-full  h-fit bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
    <div class="mb-4 flex justify-center">

      <select bind:value={viewType}         class="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="hourly">By Hour</option>
        <option value="daily">By Day</option>
        <option value="monthly">By Month</option>
      </select>
    </div>
    <div class="flex-1  h-[65vh]" >

    <canvas id="eventEngagementChart"></canvas>
    </div>
  </div>