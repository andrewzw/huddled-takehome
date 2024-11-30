<script lang="ts">
  import type { PageData } from "./$types";
  import LineChart from "$lib/components/lineChart.svelte";
  import EventBarChart from "$lib/components/eventBarChart.svelte"; 
  import EventLineChart from "$lib/components/eventLineChart.svelte";

  let { data }: { data: PageData } = $props();
  let selectedArtist = $state<string>("Average of all artists");
  let currentPage = $state(1);
  let eventCharts = ["Event Engagement by Points and Occurance", "Event Type Trend"];
  let selectedEventChart = $state<string>("Event Engagement by Points and Occurance");
  function goToPage(page: number) {
    if (page >= 1 && page <= 3) {
      currentPage = page;
    }
  }
</script>

<div class="flex flex-col items-center p-4 gap-6 min-h-[60rem]">
  <nav aria-label="data pagination" class="mb-2">
    <ul class="inline-flex -space-x-px text-sm">
      <li>
        <button
          onclick={() => goToPage(currentPage - 1)}
          class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >Previous</button
        >
      </li>
      {#each Array(3) as _, i}
        <li>
          <button
            onclick={() => goToPage(i + 1)}
            class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white {currentPage ===
            i + 1
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
              : ''}"
            >{i + 1}
          </button>
        </li>
      {/each}
      <li>
        <button
          onclick={() => goToPage(currentPage + 1)}
          class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >Next</button
        >
      </li>
    </ul>
  </nav>
  {#if currentPage === 1}
    <div class="container mx-auto max-w-screen justify-center items-center">
      <h1 class="text-2xl font-bold text-center mb-5">Artists Stats</h1> 
      <LineChart data={data.engagementStats} {selectedArtist} />
    </div>
    
    {:else if currentPage === 2}
    <div class="container mx-auto max-w-screen justify-center items-center">
      <h1 class="text-2xl font-bold text-center mb-5">Events Stats</h1> 
      <div class="max-w-md mb-2">
        <label
          for="artist-select"
          class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          Select Chart
        </label>
        <select
          id="artist-select"
          bind:value={selectedEventChart}
          class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {#each eventCharts as eventChart}
            <option value={eventChart}>{eventChart}</option>
          {/each}
        </select>
      </div>

      {#if selectedEventChart === "Event Engagement by Points and Occurance"}
      <EventBarChart data={data.eventBarStats} barTitle="Event Engagement by Points and Occurance" yTitle="Total Points" xTitle="Event Type" />
      {:else if selectedEventChart === "Event Type Trend"}
      <EventLineChart data={data.eventLineStats} />
      {/if}
    </div>

    {:else}
    <div class="container mx-auto max-w-screen justify-center items-center">
      <h1 class="text-2xl font-bold text-center mb-5">Section 3</h1> 

    </div>
  {/if}
</div>
