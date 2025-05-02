import { ref } from 'vue'

export function useTask() {
  const task = ref('say hello')
  const result = ref('')

  return {
    task,
    result,
  }
}
