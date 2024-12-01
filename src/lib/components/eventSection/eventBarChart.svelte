<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";

  let { dataAvg, dataTotal, barTitle, yTitle, xTitle, selectedArtist } =
    $props();
  let chartInstance: Chart | null = null;
  let showAverage = $state(true);

  function processData(rawData: any[]) {
    if (!showAverage || selectedArtist !== "Average of all artists") {
      return rawData;
    }

    const eventTypes = [...new Set(rawData.map((item) => item.event_type))];
    return eventTypes.map((type) => {
      const items = rawData.filter((item) => item.event_type === type);
      return {
        event_type: type,
        total_score: Math.round(
          items.reduce((sum, item) => sum + item.total_score, 0) / items.length
        ),
        total_occurrences: Math.round(
          items.reduce((sum, item) => sum + item.total_occurrences, 0) /
            items.length
        ),
      };
    });
  }

  function createChart() {
    const canvas = document.getElementById("eventsChart") as HTMLCanvasElement;
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    let processedData;
    if (selectedArtist === "Average of all artists") {
      processedData = showAverage ? processData(dataAvg) : dataTotal;
    } else {
      processedData = dataAvg.filter(
        (record) => record.artist_name === selectedArtist
      );
    }

    const colors = {
      PLAY_TRACK: "rgb(75, 192, 192,0.5)",
      SHARE_TRACK: "rgb(255, 99, 132,0.5)",
      ADD_TRACK_TO_PLAYLIST: "rgb(255, 205, 86,0.5)",
      LIKE_TRACK: "rgb(54, 162, 235,0.5)",
    };

    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: processedData.map((item: any) => item.event_type.toUpperCase()),
        datasets: [
          {
            label: `${showAverage && selectedArtist === "Average of all artists" ? " (Average)" : " (Total)"} Points`,
            data: processedData.map((item: any) => item.total_score),
            backgroundColor: processedData.map(
              (item: any) => colors[item.event_type.toUpperCase()]
            ),
            borderColor: processedData.map(
              (item: any) => colors[item.event_type.toUpperCase()]
            ),
            borderWidth: 2,
            barPercentage: 0.8,
            order: 1,
          },
          {
            label: `${showAverage && selectedArtist === "Average of all artists" ? " (Average)" : " (Total)"} Occurrences`,
            data: processedData.map((item: any) => item.total_occurrences),
            borderColor: processedData.map(
              (item: any) => colors[item.event_type.toUpperCase()]
            ),
            borderWidth: 4,
            barPercentage: 0.8,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${barTitle}${selectedArtist !== "Average of all artists" ? ` - ${selectedArtist}` : ""}${showAverage && selectedArtist === "Average of all artists" ? " (Average)" : " (Total)"}`,
            color: "#f5fefd",
            font: { size: 16 },
          },
          legend: {
            display: true,
            labels: {
              color: "#f5fefd",
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xTitle,
              color: "#f5fefd",
            },
            ticks: {
              color: "#f5fefd",
            },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: yTitle,
              color: "#f5fefd",
            },
            ticks: {
              color: "#f5fefd",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.6)",
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

  function toggleButton() {
    showAverage = !showAverage;
  }
</script>

<div class="w-full flex h-fit bg-white dark:bg-gray-800 p-4 rounded-t-lg">
  {#if selectedArtist === "Average of all artists"}
    <div class="max-w-md">
      <button
        onclick={toggleButton}
        class="px-3 py-2 bg-white rounded-full shadow-sm dark:bg-gray-700 border dark:border-gray-600 dark:text-white hover:bg-gray-200 hover:text-gray-950"
      >
        {showAverage ? "Show Total" : "Show Average"}
      </button>
    </div>
  {/if}

  <div class="flex-1 h-[65vh] w-fit">
    <canvas id="eventsChart"></canvas>
  </div>
</div>
