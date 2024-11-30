<script lang="ts">
  import EngagementLineChart from "$lib/components/engagementSection/engagementLineChart.svelte";
  import EngagementRadarChart from "$lib/components/engagementSection/engagementRadarChart.svelte";

  let { data, selectedArtist } = $props();
</script>

<div
  class="container mx-auto max-w-screen justify-center items-center min-h-full"
>
  <h1 class="text-2xl font-bold text-center mb-5">Engagement Stats</h1>

  <EngagementLineChart data={data.engagementStats} {selectedArtist} />
  <EngagementRadarChart data={data.artistRadarStats} />
</div>
