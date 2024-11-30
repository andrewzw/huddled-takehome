<script lang="ts">
  let { artistVisits } = $props();

  function formatDuration(duration: number): string {
    // duration is in milliseconds
    const seconds = Math.floor(duration / 1000);
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours === 0 && remainingMinutes === 0) {
      return `${remainingSeconds}s`; //less than 1 min
    } else if (hours === 0) {
      return `${remainingMinutes}m ${remainingSeconds}s`; //less than 1 hour
    }
    return remainingSeconds > 0
      ? `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
      : `${hours}h ${remainingMinutes}m`; //more than 1 hour
  }

  let currentPage = $state(1);
  const itemsPerPage = 15;

  const totalPages = $derived(Math.ceil(artistVisits.length / itemsPerPage));
  const paginatedArtistVisits = $derived(
    artistVisits.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  );

  function goToPage(page: number, totalPages: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
</script>

<div class="overflow-x-auto">
  <nav aria-label="data pagination" class="mb-2">
    <ul class="inline-flex -space-x-px text-sm">
      <li>
        <button
          onclick={() => goToPage(currentPage - 1, totalPages)}
          class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >Previous</button
        >
      </li>
      {#each Array(totalPages) as _, i}
        <li>
          <button
            onclick={() => goToPage(i + 1, totalPages)}
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
          onclick={() => goToPage(currentPage + 1, totalPages)}
          class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >Next</button
        >
      </li>
    </ul>
  </nav>
  <div
    class="min-w-max w-[60rem] h-[60em] overflow-y-auto relative scrollbar-pretty"
  >
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 border-b-2"
      >
        <tr>
          <th scope="col" class="px-6 py-3">Artist Id</th>
          <th scope="col" class="px-6 py-3">Artist Name</th>
          <!-- removed (minutes) -->
          <th scope="col" class="px-6 py-3">Total Time Spent</th>
          <!-- added headin "Total Unique Visitors" -->
          <th scope="col" class="px-6 py-3">Total Unique Visitors</th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedArtistVisits as { artist_id, artist_name, total_visit_duration, unique_session_count }}
          <tr
            class="bg-white border-b dark:even:bg-gray-800 dark:border-gray-700 dark:odd:bg-gray-700"
          >
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {artist_id}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {artist_name}
            </td>
            <td class="px-6 py-4">
              {formatDuration(total_visit_duration)}
            </td>
            <td class="px-6 py-4">
              {unique_session_count}
              <!-- Remove misused of formatDuration -->
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  /* Custom scrollbar styles */
  .scrollbar-pretty::-webkit-scrollbar {
    width: 10px;
  }

  .scrollbar-pretty::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .scrollbar-pretty::-webkit-scrollbar-thumb {
    background: rgba(149, 158, 160, 0.5);
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .scrollbar-pretty::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 100, 100, 0.7);
  }
</style>
