<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";

  let { data, barTitle, selectedArtist } = $props();
  let chartInstance: Chart | null = null;
  let viewType = $state("points");

  function timePeriodsChart() {
    const canvas = document.getElementById(
      "timePeriodsChart"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const timePeriods = [
      "00:00-05:59",
      "06:00-11:59",
      "12:00-17:59",
      "18:00-23:59",
    ];

    const datasets =
      viewType === "points"
        ? [
            //by points
            {
              label: "PLAY TRACK",
              data: data.map(
                (d: { play_track_score: number }) => d.play_track_score
              ),
              backgroundColor: "rgb(75, 192, 192,0.5)",
              stack: "engagement",
            },
            {
              label: "SHARE TRACK",
              data: data.map(
                (d: { share_track_score: number }) => d.share_track_score
              ),
              backgroundColor: "rgb(255, 99, 132,0.5)",
              stack: "engagement",
            },
            {
              label: "ADD TO PLAYLIST",
              data: data.map(
                (d: { playlist_score: number }) => d.playlist_score
              ),
              backgroundColor: "rgb(255, 205, 86,0.5)",
              stack: "engagement",
            },
            {
              label: "LIKE TRACK",
              data: data.map(
                (d: { like_track_score: number }) => d.like_track_score
              ),
              backgroundColor: "rgb(54, 162, 235,0.5)",
              stack: "engagement",
            },
          ]
        : [
            //by count
            {
              label: "PLAY TRACK (Count)",
              data: data.map(
                (d: { play_track_count: number }) => d.play_track_count
              ),
              backgroundColor: "rgb(75, 192, 192,0.15)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 3,
              stack: "counts",
            },
            {
              label: "SHARE TRACK (Count)",
              data: data.map(
                (d: { share_track_count: number }) => d.share_track_count
              ),
              backgroundColor: "rgb(255, 99, 132,0.15)",
              borderColor: "rgb(255, 99, 132)",
              borderWidth: 3,
              stack: "counts",
            },
            {
              label: "ADD TO PLAYLIST (Count)",
              data: data.map(
                (d: { playlist_count: number }) => d.playlist_count
              ),
              backgroundColor: "rgb(255, 205, 86,0.15)",
              borderColor: "rgb(255, 205, 86)",
              borderWidth: 3,
              stack: "counts",
            },
            {
              label: "LIKE TRACK (Count)",
              data: data.map(
                (d: { like_track_count: number }) => d.like_track_count
              ),
              backgroundColor: "rgb(54, 162, 235,0.15)",
              borderColor: "rgb(54, 162, 235)",
              borderWidth: 3,
              stack: "counts",
            },
          ];

    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: timePeriods,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: barTitle,
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
              text: "Time Period",
              color: "#f5fefd",
            },
            ticks: { color: "#f5fefd" },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text:
                viewType === "points"
                  ? "Total Engagement Points"
                  : "Total Engagement Count",
              color: "#f5fefd",
            },
            ticks: { color: "#f5fefd" },
            stacked: true,
            grid: {
              color: "rgba(255, 255, 255, 0.6)",
            },
          },
        },
      },
    });
  }
  $effect(() => {
    timePeriodsChart();
  });

  onMount(() => {
    timePeriodsChart();
  });

  function toggleButton() {
    if (viewType === "points") {
      viewType = "counts";
    } else {
      viewType = "points";
    }
  }
</script>

<div
  class="w-full flex h-fit bg-white dark:bg-gray-800 p-4 border-t-4 rounded-b-lg shadow"
>
  <div class="max-w-md">
    <button
      onclick={toggleButton}
      class="px-3 py-2 bg-white rounded-full shadow-sm dark:bg-gray-700 border dark:border-gray-600 dark:text-white hover:bg-gray-200 hover:text-gray-950"
    >
      {viewType == "counts" ? "View Points" : "View Count"}
    </button>
  </div>

  <div class="flex-1 h-[65vh] w-fit">
    <canvas id="timePeriodsChart"></canvas>
  </div>
</div>
