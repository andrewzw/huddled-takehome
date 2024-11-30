<script lang="ts">
  import { Chart } from "chart.js/auto";

  let { data } = $props();
  let chartInstance: Chart | null = null;
  let isComparing = $state(false);
  let selectedArtists = $state<string[]>(["Average of all artists"]);
  const colors = [
    { bg: "rgba(75, 192, 192, 0.2)", border: "rgb(75, 192, 192)" },
    { bg: "rgba(255, 99, 132, 0.2)", border: "rgb(255, 99, 132)" },
    { bg: "rgba(255, 205, 86, 0.2)", border: "rgb(255, 205, 86)" },
    { bg: "rgba(54, 162, 235, 0.2)", border: "rgb(54, 162, 235)" },
    { bg: "rgba(153, 102, 255, 0.2)", border: "rgb(153, 102, 255)" },
  ];

  function processData() {
    const metrics = [
      "play_count",
      "like_count",
      "playlist_count",
      "share_count",
    ];
    const labels = ["Plays", "Likes", "Playlist Adds", "Shares"];
    let datasets: {
      label: string;
      data: number[];
      fill: boolean;
      backgroundColor: string;
      borderColor: string;
      pointBackgroundColor: string;
      pointBorderColor: string;
    }[] = [];

    //console.log("artist Radar Chart data:", data);

    selectedArtists.forEach((artist, index) => {
      if (artist === "Average of all artists") {
        const averageData = metrics.map((metric) => {
          const sum = data.reduce(
            (acc: number, curr: any) => acc + curr[metric],
            0
          );
          return Math.round(sum / data.length);
        });

        datasets.push({
          label: "Average Engagement",
          data: averageData,
          fill: true,
          backgroundColor: colors[index].bg,
          borderColor: colors[index].border,
          pointBackgroundColor: colors[index].border,
          pointBorderColor: "#fff",
        });
      } else {
        const artistData = data.find((d: any) => d.artist_name === artist);
        if (artistData) {
          datasets.push({
            label: `${artist}'s Engagement`,
            data: metrics.map((m) => artistData[m]),
            fill: true,
            backgroundColor: colors[index].bg,
            borderColor: colors[index].border,
            pointBackgroundColor: colors[index].border,
            pointBorderColor: "#fff",
          });
        }
      }
    });

    return { labels, datasets };
  }

  function createChart() {
    const canvas = document.getElementById("radarChart") as HTMLCanvasElement;
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const chartData = processData();

    chartInstance = new Chart(canvas, {
      type: "radar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: isComparing
              ? "Artist Engagement Dominance Comparison"
              : "Artist Engagement Dominance",
            color: "#f5fefd",
            font: { size: 16 },
          },
          legend: {
            position: "top",
            labels: { color: "#f5fefd" },
          },
        },
        scales: {
          r: {
            angleLines: {
              color: "rgba(255, 255, 255, 0.6)",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.6)",
            },
            pointLabels: {
              color: "#f5fefd",
              font: { size: 14 },
            },
            ticks: {
              color: "#f5fefd",
              backdropColor: "transparent",
            },
          },
        },
      },
    });
  }

  function addArtist() {
    if (selectedArtists.length < 5) {
      selectedArtists = [...selectedArtists, "Average of all artists"];
    }
  }

  function removeArtist(index: number) {
    selectedArtists = selectedArtists.filter((_, i) => i !== index);
  }
  function handleCompareToggle(event: Event) {
    isComparing = (event.target as HTMLInputElement).checked;
    if (!isComparing) {
      selectedArtists = ["Average of all artists"];
      createChart();
    }
  }
  $effect(() => {
    createChart();
  });
</script>

<div
  class="w-full flex min-h-[650px] bg-white dark:bg-gray-800 p-4 rounded-b-lg shadow pt-10"
>
  <div class="flex-1 max-w-md mb-2">
    <label class="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        class="sr-only peer"
        onchange={handleCompareToggle}
        checked={isComparing}
      />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
      <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
        >Compare Artists</span
      >
    </label>
    {#if isComparing}
      <div class="space-y-2">
        {#each selectedArtists as artist, i}
          <div class="flex gap-2">
            <select
              bind:value={selectedArtists[i]}
              class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Average of all artists"
                >Average of all artists</option
              >
              {#each [...new Set(data.map((d: { artist_name: string }) => d.artist_name))] as artistName}
                <option value={artistName}>{artistName}</option>
              {/each}
            </select>
            {#if i > 0}
              <button
                onclick={() => removeArtist(i)}
                class="px-2 py-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            {/if}
          </div>
        {/each}

        {#if selectedArtists.length < 5}
          <button
            onclick={addArtist}
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Artist
          </button>
        {/if}
      </div>
    {:else}
      <select
        bind:value={selectedArtists[0]}
        class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="Average of all artists">Average of all artists</option>
        {#each [...new Set(data.map((d: { artist_name: string }) => d.artist_name))] as artist}
          <option value={artist}>{artist}</option>
        {/each}
      </select>
    {/if}
  </div>
  <div class="flex-1 h-[65vh] w-full">
    <canvas id="radarChart"></canvas>
  </div>
</div>
