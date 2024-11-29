<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";

  let { data, selectedArtist } = $props();
  let chartInstance: Chart | null = null;
  let artists = $state<string[]>([]);

  // Process data to group by artist and hour
  function processData() {
    const artistData = new Map();
    const averageData = Array(24).fill(0);
    const artistCountPerHour = Array(24).fill(0);

    data.forEach((record: any) => {
      if (!artistData.has(record.artist_name)) {
        // if doesnt exist
        artistData.set(record.artist_name, Array(24).fill(0)); //1 hr for each
      }
      const hourData = artistData.get(record.artist_name); //get the artist's hourly data
      const hour = parseInt(record.hour); //convert to int
      hourData[hour] = record.total_engagement; //set engagement score at hour index

      averageData[hour] += record.total_engagement;
      artistCountPerHour[hour]++;
    });

    //calculate average for each hour
    for (let i = 0; i < 24; i++) {
      if (artistCountPerHour[i] > 0) {
        averageData[i] = averageData[i] / artistCountPerHour[i];
      }
    }

    artistData.set("Average of all artists", averageData); //use average if no artist selected

    //console.log(averageData);
    //console.log(artistData);
    return artistData;
  }

  // Process artists for dropdown
  function processArtists() {
    const uniqueArtists = new Set<string>();
    data.forEach((record: any) => {
      uniqueArtists.add(record.artist_name);
    });
    artists = Array.from(uniqueArtists).sort();
  }

  onMount(() => {
    processArtists();
  });

  function createChart(artistName: string) {
    const canvas = document.getElementById(
      "engagementChart"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const artistData = processData();
    const hourLabels = Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}:00`
    );

    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: hourLabels,
        datasets: [
          {
            label:
              artistName === "Average of all artists"
                ? "Average Engagement of all artists"
                : `${artistName}'s Engagement`,
            data: artistData.get(artistName),
            fill: true,
            backgroundColor: "rgb(245, 254, 253, 0.3)",
            borderColor: "rgb(75, 192, 192)",
            pointBorderColor: "#fffff",
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "rgb(54, 162, 235)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Hourly Engagement Pattern for ${artistName}`,
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
              text: "Hour of Day",
              color: "#f5fefd",
            },
            ticks: {
              color: "rgb(245, 254, 253,0.7)",
            },
            grid: {
              display: true,
              color: "rgb(245, 254, 253,0.5)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Engagement Score",
              color: "#f5fefd",
            },
            ticks: {
              color: "rgb(245, 254, 253,0.7)", //#f5fefd
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
</script>

<div
  class="flex flex-col w-full max-w-4xl h-[600px] gap-6 bg-white dark:bg-gray-700 p-4 rounded-lg shadow"
>
  <div class="max-w-md">
    <label
      for="artist-select"
      class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
    >
      Select Artist
    </label>
    <select
      id="artist-select"
      bind:value={selectedArtist}
      class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <option value="Average of all artists">Average of all artists</option>
      {#each artists as artist}
        <option value={artist}>{artist}</option>
      {/each}
    </select>
  </div>

  <div
    class="w-full h-[600px] bg-white dark:bg-slate-950 p-4 rounded-lg shadow"
  >
    <canvas id="engagementChart"></canvas>
  </div>
</div>
