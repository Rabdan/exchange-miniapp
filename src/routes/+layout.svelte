<script>
  import './app.css';
  export let data;
</script>

<main>
  <slot />
</main>

<style>
  main {
    width: 100%;
    max-width: 480px;
    padding: 20px;
    margin: 0 auto;
  }
</style>
