<script lang="ts">
  import { Chart } from "chart.js/auto";

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
            borderColor: "rgb(255, 205, 86,1)",
            pointBorderColor: "#fffff",
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "rgb(255, 0, 0)",
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
              text: "Engagement Score",
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
</script>

<div
  class="w-full flex min-h-[650px] bg-white dark:bg-gray-800 p-7 rounded-t-lg shadow border-b-4"
>
  <div class="flex-1 w-full">
    <canvas id="engagementChart"></canvas>
  </div>
</div>
