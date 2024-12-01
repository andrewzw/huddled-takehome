<script lang="ts">
  import EventStackBarChart from "$lib/components/eventSection/eventStackBarChart.svelte";
  import EventBarChart from "$lib/components/eventSection/eventBarChart.svelte";
  import EventLineChart from "$lib/components/eventSection/eventLineChart.svelte";
  let { data, selectedArtist } = $props();
  let selectedEventChart = $state<string>("Event Engagement");
  let eventCharts = ["Event Engagement", "Event Type Trend"];
</script>

<div class="container mx-auto max-w-screen justify-center items-center">
  <h1 class="text-2xl font-bold text-center mb-5">Events Stats</h1>
  <div class="max-w-md mb-2">
    <label
      for="chart-select"
      class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
    >
      Select Chart
    </label>
    <select
      id="chart-select"
      bind:value={selectedEventChart}
      class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      {#each eventCharts as eventChart}
        <option value={eventChart}>{eventChart}</option>
      {/each}
    </select>
  </div>

  {#if selectedEventChart === "Event Engagement"}
    <EventBarChart
      {selectedArtist}
      dataAvg={data.eventBarStatsAvg}
      dataTotal={data.eventBarStatsTotal}
      barTitle="Event Engagement by Points and Occurance"
      yTitle="Total Points"
      xTitle="Event Type"
    />
    <EventStackBarChart
      {selectedArtist}
      data={data.eventStackBarStats}
      barTitle="Event Engagement by Time Period"
    />
  {:else if selectedEventChart === "Event Type Trend"}
    <EventLineChart data={data.eventLineStats} {selectedArtist} />
  {/if}
</div>
