<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";

  let { data, selectedArtist = "Average of all artists" } = $props();
  let chartInstance: Chart | null = null;
  let viewType = $state("hourly");

  function processData() {
    const eventData = new Map<string, number[]>();
    const eventTypes = [
      "like_track",
      "add_track_to_playlist",
      "play_track",
      "share_track",
    ];
    const periodLength =
      viewType === "hourly" ? 24 : viewType === "daily" ? 7 : 31;
    const averageData = Array(periodLength).fill(0);

    // filter by artist
    const filteredData =
      selectedArtist === "Average of all artists"
        ? data
        : data.filter((record: any) => record.artist_name === selectedArtist);

    switch (viewType) {
      case "hourly":
        eventTypes.forEach((type) => {
          eventData.set(type, Array(24).fill(0));
        });
        filteredData.forEach((record: any) => {
          const hourData = eventData.get(record.event_type);
          const hour = parseInt(record.hour);
          if (hourData) {
            hourData[hour] += record.total_engagement;
          }
        });
        break;

      case "daily":
        eventTypes.forEach((type) => {
          eventData.set(type, Array(7).fill(0));
        });
        filteredData.forEach((record: any) => {
          const dayData = eventData.get(record.event_type);
          const day = parseInt(record.day_of_week);
          if (dayData) {
            dayData[day] += record.total_engagement;
          }
        });
        break;

      case "monthly":
        eventTypes.forEach((type) => {
          eventData.set(type, Array(31).fill(0));
        });
        filteredData.forEach((record: any) => {
          const monthData = eventData.get(record.event_type);
          const day = parseInt(record.month);
          if (monthData) {
            monthData[day - 1] += record.total_engagement;
          }
        });
        break;
    }

    // average of each time period
    for (let i = 0; i < periodLength; i++) {
      let sum = 0;
      let count = 0;
      eventTypes.forEach((type) => {
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
      switch (viewType) {
        case "hourly":
          return Array.from(
            { length: 24 },
            (_, i) => `${i.toString().padStart(2, "0")}:00`
          );
        case "daily":
          return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
        case "monthly":
          return Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);
        default:
          return [];
      }
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
              label: type.replace(/_/g, " ").toUpperCase(),
              data: data,
              fill: true,
              backgroundColor: "transparent",
              borderColor: colors[type],
              tension: 0.4,
              pointRadius: 4,
            })),
          {
            label: "AVERAGE",
            data: eventData.get("average") ?? [],
            borderColor: "rgb(255, 255, 255)",
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
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
                ? "Engagement Points by Hours of Day"
                : viewType === "daily"
                  ? "Engagement Points by Days of Week"
                  : "Engagement Points by Days of Month"),
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
                viewType === "hourly"
                  ? "Hours"
                  : viewType === "daily"
                    ? "Days"
                    : "Months",
              color: "#f5fefd",
            },
            ticks: { color: "#f5fefd" },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
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
              color: "rgba(255, 255, 255, 0.1)",
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
    }
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
  </ul>

  <div class="flex-1 h-[65vh]">
    <canvas id="eventEngagementChart"></canvas>
  </div>
</div>
