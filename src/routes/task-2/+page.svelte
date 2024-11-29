<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import LineChart from "$lib/components/lineChart.svelte";

  let { data }: { data: PageData } = $props();
  let selectedArtist = $state<string | null>(null);
  let artists = $state<string[]>([]);

  // Process data to group by artist and hour
  function processArtists() {
    const uniqueArtists = new Set<string>();
    data.data.forEach((record: any) => {
      uniqueArtists.add(record.artist_name);
    });
    artists = Array.from(uniqueArtists).sort();
  }

  onMount(() => {
    processArtists();
  });
</script>

<div class="flex flex-col items-center p-4 space-y-6 h-[60rem]">
  <div
    class="w-full max-w-md min-w-max overflow-y-auto relative scrollbar-pretty"
  >
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
      <option value="">Choose an artist</option>
      {#each artists as artist}
        <option value={artist}>{artist}</option>
      {/each}
    </select>
  </div>

  {#if selectedArtist}
    <LineChart data={data.data} {selectedArtist} />
  {/if}
</div>
