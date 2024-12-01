<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";

  let { data, selectedArtist = "Average of all artists" } = $props();
  let chartInstance: Chart | null = null;
  let viewType: "hourly" | "daily" | "monthly" | "yearly" = $state("hourly");

  function initializeEventData(length: number, eventTypes: string[]) {
  const eventData = new Map<string, number[]>();
  eventTypes.forEach(type => {
    eventData.set(type, Array(length).fill(0));
  });
  return eventData;
}

function processTimeData(record: any, eventData: Map<string, number[]>, timeField: string, adjustment = 0, points: boolean) {
  const data = eventData.get(record.event_type);
  const timeValue = parseInt(record[timeField]);
  if (data && !isNaN(timeValue)) {
    data[timeValue + adjustment] += points ? record.total_engagement : record.total_occurrences;
  }
}
  function processData() {
    const eventTypes = [
      "like_track",
      "add_track_to_playlist",
      "play_track",
      "share_track",
    ];
    const periodConfig = {
    hourly: { length: 24, field: 'hour', adjustment: 0 },
    daily: { length: 7, field: 'day_of_week', adjustment: 0 },
    monthly: { length: 31, field: 'day_of_month', adjustment: -1 },
    yearly: { length: 12, field: 'month', adjustment: -1 }
  };

  const config = periodConfig[viewType as "hourly" | "daily" | "monthly" | "yearly"];
  const eventData = initializeEventData(config.length, eventTypes);
  const averageData = Array(config.length).fill(0);

    // filter by artist
    const filteredData =
      selectedArtist === "Average of all artists"
        ? data
        : data.filter((record: any) => record.artist_name === selectedArtist);

//process data
filteredData.forEach((record: any) => {
    processTimeData(record, eventData, config.field, config.adjustment, points);
  });

  //calc average data when average of all artists selected
  for (let i = 0; i < config.length; i++) {
    let sum = 0, count = 0;
    eventTypes.forEach(type => {
      const data = eventData.get(type);
      if (data && data[i]) {
        sum += data[i];
        count++;
      }
    });
    averageData[i] = count > 0 ? sum / count : 0;
  }
  eventData.set("average", averageData);

  return eventData;
}

  function createChart() {
    const canvas = document.getElementById(
      "eventEngagementChart"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const eventData = processData();
    const labels = (() => {
  const labelConfig = {
    hourly: () => Array.from({ length: 24 }, (_, i) => 
      `${i.toString().padStart(2, "0")}:00`),
    daily: () => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthly: () => Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`),
    yearly: () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };
  return labelConfig[viewType]?.() || [];
})();

    const colors: { [key: string]: string } = {
      like_track: "rgb(75, 192, 192)",
      add_track_to_playlist: "rgb(255, 99, 132)",
      play_track: "rgb(255, 205, 86)",
      share_track: "rgb(54, 162, 235)",
    };

    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          ...Array.from(eventData.entries())
            .filter(([type]) => type !== "average")
            .map(([type, data]) => ({
              label: `${type.replace(/_/g, " ").toUpperCase()} ${points  ? "(Points)" : "(Occurrences)"}`,
              data: data,
              fill: true,
              backgroundColor: "transparent",
              borderColor: colors[type],
              tension: 0.4,
              pointRadius: 4,
              pointHoverBackgroundColor: "colors[type]",
            pointHoverBorderWidth: 6,
            })),
          {
            label: `AVERAGE ${points? "(Points)" : "(Occurrences)"}`,
            data: eventData.get("average") ?? [],
            borderColor: "rgb(255, 255, 255)",
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 4,
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
            text:
              `${selectedArtist === "All artists" ? "" : selectedArtist + " - "}` +
              (viewType === "hourly"
                ? ` Hours of Day Engagement by `
                : viewType === "daily"
                  ? `Days of Week Engagement by `
                  : `Days of Month Engagement by `) +`(${points ? "Points" : "Occurrences"})` ,
            color: "#f5fefd",
            font: { size: 16 },
          },
          legend: {
            position: "top",
            labels: { color: "#f5fefd" },
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
            ticks: { color: "#f5fefd" },
            grid: {
              display: true,
              color: "rgb(245, 254, 253,0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Engagement Points",
              color: "#f5fefd",
            },
            ticks: { color: "#f5fefd" },
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgb(245, 254, 253,0.1)",
            },
          },
        },
      },
    });
  }

  onMount(() => {
    createChart();
  });

  $effect(() => {
    createChart();
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

  let points = $state(true);
  function togglePoints() {
    points = !points;
  }
</script>

<div class="w-full h-fit bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
  <ul
    class="flex flex-wrap text-sm font-medium text-center text-gray-500 border-gray-200 dark:border-gray-700 dark:text-gray-400"
  >
    <li class="me-2">
      <button
        onclick={() => toggleButton("hourly")}
        aria-current="page"
        class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 {viewType ===
        'hourly'
          ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500 border-b'
          : ''}">Day</button
      >
    </li>
    <li class="me-2">
      <button
        onclick={() => toggleButton("daily")}
        class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 {viewType ===
        'daily'
          ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500 border-b'
          : ''}">Week</button
      >
    </li>
    <li class="me-2">
      <button
        onclick={() => toggleButton("monthly")}
        class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 {viewType ===
        'monthly'
          ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500 border-b'
          : ''}">Month</button
      >
    </li>
    <li class="me-2">
      <button
        onclick={() => toggleButton("yearly")}
        class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 {viewType ===
        'yearly'
          ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500 border-b'
          : ''}">Year</button
      >
    </li>
  </ul>
  <div class="max-w-md">


    
<label class="inline-flex items-center cursor-pointer mt-2">
  <input type="checkbox" value="" class="sr-only peer" onclick={togglePoints}>
  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">View Occurance</span>
</label>

  </div>
  <div class="flex-1 h-[65vh]"
  >

    <canvas id="eventEngagementChart"></canvas>
  </div>
</div>
