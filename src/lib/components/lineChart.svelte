<script lang="ts">
  import { Chart } from "chart.js/auto";

  let { data, selectedArtist } = $props();
  let chartInstance: Chart | null = null;
  // Process data to group by artist and hour
  function processData() {
    const artistData = new Map();
    const uniqueArtists = new Set<string>(); //no duplicates

    data.forEach((record: any) => {
      if (!artistData.has(record.artist_name)) {
        // if doesnt exist
        artistData.set(record.artist_name, Array(24).fill(0)); //1 hr for each
        uniqueArtists.add(record.artist_name);
      }
      const hourData = artistData.get(record.artist_name); //get the artist's hourly data
      hourData[parseInt(record.hour)] = record.total_engagement; //set engagement score at hour index
    });

    //console.log(artistData);
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
            label: `${artistName} Engagement`,

            data: artistData.get(artistName),
            fill: true,
            backgroundColor: "rgb(245, 254, 253, 0.3)",
            borderColor: "rgb(75, 192, 192)",
            tension: 0.4,
            pointRadius: 4,
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
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Hour of Day",
              color: "#f5fefd",
            },
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.3)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Engagement Score",
              color: "#f5fefd",
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.3)",
            },
          },
        },
      },
    });
  }

  $effect(() => {
    if (selectedArtist) {
      createChart(selectedArtist);
    }
  });
</script>

<div
  class="w-full max-w-4xl h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
>
  <canvas id="engagementChart"></canvas>
</div>
