<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'
  placeholder?: string
  modelValue?: string | number
  class?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const classes = computed(() =>
  cn(
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring focus-visible:shadow-lg',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'hover:border-ring/50',
    props.class
  )
)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :class="classes"
    @input="handleInput"
  />
</template>
