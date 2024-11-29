<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import LineChart from "$lib/components/lineChart.svelte";

  let { data }: { data: PageData } = $props();
  let selectedArtist = $state<string>("Average of all artists");
  let currentPage = $state(1);

  function goToPage(page: number) {
    if (page >= 1 && page <= 3) {
      currentPage = page;
    }
  }
</script>

<div class="flex flex-col items-center p-4 gap-6 h-[60rem]">
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
    <div class="container mx-auto max-w-4xl justify-center items-center">
      <LineChart data={data.engagementStats} {selectedArtist} />
    </div>
  {:else if currentPage === 2}
    <div class="container mx-auto max-w-4xl justify-center items-center">
      <p>Section 2</p>
    </div>
  {:else}
    <div class="container mx-auto max-w-4xl justify-center items-center">
      <p>Section 3</p>
    </div>
  {/if}
</div>
