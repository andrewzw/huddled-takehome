<script lang="ts">
  import { Chart } from "chart.js/auto";

  let { data, selectedArtist } = $props();
  let chartInstance: Chart | null = null;
  let viewType = $state("hourly");

 
  function processData() {
  const artistData = new Map();
  let periodLength = 
    viewType === "hourly" ? 24 : 
    viewType === "daily" ? 7 : 
    viewType === "monthly" ? 31 : 12;
  
  const averageData = Array(periodLength).fill(0);
  const artistCountPerPeriod = Array(periodLength).fill(0);

  // filter data for current view type
  const periodData = data.filter((record: { period_type: string }) => record.period_type === viewType);

  periodData.forEach((record: any) => {
    if (!artistData.has(record.artist_name)) {
      artistData.set(record.artist_name, Array(periodLength).fill(0));
    }

    const artistPeriodData = artistData.get(record.artist_name);
    const period = viewType === "hourly" ? parseInt(record.hour) :
                  viewType === "daily" ? parseInt(record.day_of_week) :
                  viewType === "monthly" ? parseInt(record.day) - 1 :
                  parseInt(record.month) - 1;

    artistPeriodData[period] += record.total_engagement;
    averageData[period] += record.total_engagement;
    artistCountPerPeriod[period]++;
  });

  // Calculate averages
  for (let i = 0; i < periodLength; i++) {
    if (artistCountPerPeriod[i] > 0) {
      averageData[i] = averageData[i] / artistCountPerPeriod[i];
    }
  }

  artistData.set("Average of all artists", averageData);
  return artistData;
}

  function createChart(artistName: string) {
    const canvas = document.getElementById(
      "engagementChart"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const artistData = processData();
    const labels = (() => {
      switch (viewType) {
        case "hourly":
          return Array.from(
            { length: 24 },
            (_, i) => `${i.toString().padStart(2, "0")}:00`
          );
        case "daily":
          return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        case "monthly":
          return Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);
          case "yearly":
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        default:
          return [];
      }
    })();

    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label:
              artistName === "Average of all artists"
                ? "Average Engagement of all artists"
                : `${artistName}'s Engagement Points`,
            data: artistData.get(artistName),
            fill: true,
            borderColor: "rgb(255, 255, 255)",
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            pointRadius: 4,
            pointBorderColor:  "rgb(255, 255, 255)",
            pointBackgroundColor: "rgb(255, 0, 0)",
            pointHoverBackgroundColor: "rgb(255, 255, 255)",
            pointHoverBorderWidth: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${viewType.charAt(0).toUpperCase() + viewType.slice(1)} Engagement Pattern for ${artistName}`,
            color: "#f5fefd",
            font: { size: 16 },
          },
          legend: {
            position: "top",
            labels: {
              color: "#f5fefd",
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 
                viewType === "hourly" ? "Hour of Day" :
                viewType === "daily" ? "Day of Week" :
                viewType === "monthly" ? "Day of Month" : "Month of Year",
              color: "#f5fefd",
            },
            ticks: {
              color: "#f5fefd",
            },
            grid: {
              display: true,
              color: "rgb(245, 254, 253,0.5)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Engagement Point",
              color: "#f5fefd",
            },
            ticks: {
              color: "#f5fefd",
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgb(245, 254, 253,0.5)",
            },
          },
        },
      },
    });
  }

  $effect(() => {
    createChart(selectedArtist);
  });

  function toggleButton(newType: string) {
    switch (newType) {
      case "monthly":
        viewType = "monthly";
        break;
      case "hourly":
        viewType = "hourly";
        break;
      case "daily":
        viewType = "daily";
        break;
      case "yearly":
        viewType = "yearly";
        break;
    }
  }
</script>

<div
  class="w-full flex flex-col min-h-[650px] bg-white dark:bg-gray-800 p-7 rounded-t-lg shadow border-b-4"
>

  <ul
    class="flex flex-wrap w-fit text-sm font-medium text-center bg-[#020617] rounded-lg h-fit text-gray-500 border-gray-200 dark:border-gray-700 dark:text-gray-400"
  >
    <li class="">
      <button
        onclick={() => toggleButton("hourly")}
        aria-current="page"
        class="inline-block p-4 rounded-tl-lg rounded-bl-lg hover:text-gray-600 hover:border-b hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-70 dark:hover:text-gray-300 {viewType ===
        'hourly'
          ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-70 dark:text-blue-500 border-b'
          : ''}">Day</button
      >
    </li>
    <li class="">
      <button
        onclick={() => toggleButton("daily")}
        class="inline-block p-4  hover:text-gray-600 hover:border-b hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-70 dark:hover:text-gray-300 {viewType ===
        'daily'
        ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-70 dark:text-blue-500 border-b'
        : ''}">Week</button
      >
    </li>
    <li class="">
      <button
        onclick={() => toggleButton("monthly")}
        class="inline-block p-4 hover:text-gray-600 hover:border-b hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-70 dark:hover:text-gray-300 {viewType ===
        'monthly'
        ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-70 dark:text-blue-500 border-b'
        : ''}">Month</button
      >
    </li>
    <li class="">
      <button
        onclick={() => toggleButton("yearly")}
        class="inline-block p-4 rounded-tr-lg rounded-br-lg hover:text-gray-600 hover:border-b hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-70 dark:hover:text-gray-300 {viewType ===
        'yearly'
        ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-70 dark:text-blue-500 border-b '
        : ''}">Year</button
      >
    </li>
  </ul>

  <div class="flex-1 w-full">
    <canvas id="engagementChart"></canvas>
  </div>
</div>
