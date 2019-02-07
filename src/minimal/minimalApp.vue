<template>
  <div>
    <span>{{message}}</span><br/>
    <input v-model="message">
  </div>
</template>

<script type="text/javascript">
  export default {
    data: () => ({
      message: 'test',
    }),
  }
</script>
