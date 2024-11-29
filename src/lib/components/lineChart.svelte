<script lang="ts">
  import { Chart } from "chart.js/auto";
  import { onMount } from "svelte";
  let chartInstance: Chart | null = null;
  // Process data to group by artist and hour

  function processData() {
    const artistData = new Map();
    const uniqueArtists = new Set<string>();

    data.data.forEach((record: any) => {
      if (!artistData.has(record.artist_name)) {
        artistData.set(record.artist_name, Array(24).fill(0));
        uniqueArtists.add(record.artist_name);
      }
      const hourData = artistData.get(record.artist_name);
      hourData[parseInt(record.hour)] = record.total_engagement;
    });

    artists = Array.from(uniqueArtists).sort();
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
</script>
