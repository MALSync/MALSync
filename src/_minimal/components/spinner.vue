<template>
  <div class="square-spinner">
    <div class="e1"></div>
  </div>
</template>

<style lang="less" scoped>
.square-spinner {
  position: relative;
  height: 50px;
  width: 50px;
  margin: 50px auto;

  .e1 {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    border-radius: 50%;
    border-top: 5px solid var(--cl-text);
    border-bottom: 5px solid var(--cl-text);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    animation: spinner 0.75s infinite;
  }
}

@keyframes spinner {
  0% {
    transform: rotateZ(45deg);
  }

  70% {
    transform: rotateZ(225deg);
  }

  100% {
    transform: rotateZ(225deg);
  }
}
</style>
