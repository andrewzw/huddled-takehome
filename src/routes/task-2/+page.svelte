<script lang="ts">
  import type { PageData } from "./$types";
  import EngagementSection from "$lib/components/engagementSection/engagementSection.svelte";
  import EventSection from "$lib/components/eventSection/eventSection.svelte";
  let { data }: { data: PageData } = $props();
  let selectedArtist = $state<string>("Average of all artists");
  let currentPage = $state(1);

  function goToPage(page: number) {
    if (page >= 1 && page <= 2) {
      currentPage = page;
    }
  }

  //clock=
  function formatDateTime() {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = days[date.getDay()];

    return {
      time: `${hours}:${minutes}:${seconds}`,
      date: date.toLocaleDateString(),
      day: dayOfWeek,
      raw: date,
    };
  }

  let dateTime = $state(formatDateTime());

  // Update time every second
  setInterval(() => {
    dateTime = formatDateTime();
  }, 1000);
</script>

<div class="flex flex-col items-center p-4 gap-2 min-h-[60rem]">
  <div class="flex gap-20 p-4">
    <!-- pagination -->
    <nav aria-label="data pagination" class="mb-2">
      <ul class="inline-flex -space-x-px text-sm">
        <li>
          <button
            onclick={() => goToPage(currentPage - 1)}
            class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >Previous</button
          >
        </li>
        {#each Array(2) as _, i}
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
    <!-- clock -->
    <div>
      <span class="text-3xl font-bold text-gray-700 dark:text-gray-200"
        >{dateTime.time}</span
      >
      <span class="text-xl ml-2">{dateTime.date} {dateTime.day}</span>
    </div>
    <!-- dropdown -->
    <div class="min-w-md">
      <label
        for="underline_select"
        class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
      >
        Select Artist
      </label>
      <select
        id="underline_select"
        bind:value={selectedArtist}
        class="block p-2.5 w-[200px] text-sm bg-transparent border-0 border-b-2 rounded-t-lg border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 hover:border-gray-200 peer"
      >
        <option
          value="Average of all artists"
          class="block px-4 py-2 text-sm text-gray-700"
          >Average of all artists</option
        >
        {#each [...new Set(data.engagementStats.map((d: { artist_name: string }) => d.artist_name))] as artist}
          <option
            class="block px-4 py-2 text-sm text-gray-700 bg-transparent"
            value={artist}>{artist}</option
          >
        {/each}
      </select>
    </div>
  </div>

  <!-- components -->
  {#if currentPage === 1}
    <EngagementSection {data} {selectedArtist} />
  {:else if currentPage === 2}
    <EventSection {data} {selectedArtist} />
  {/if}
</div>
