import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

export function useCurrentTime(format = 'YYYY-MM-DD HH:mm:ss') {
  const now = ref(dayjs())
  let timer = null

  const update = () => {
    now.value = dayjs()
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  const formattedNow = computed(() => now.value.format(format))

  return {
    now,
    formattedNow,
  }
}
