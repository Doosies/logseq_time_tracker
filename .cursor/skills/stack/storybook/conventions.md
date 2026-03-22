# Storybook 컨벤션

## 모듈 레벨 상태와 스토리 격리

Svelte 5 등으로 모듈 레벨 스토어를 쓰는 경우, 스토리 간 상태 누수를 막기 위해 **StoryWrapper의 onMount에서 reset()** 호출이 필요합니다. 상세는 [Svelte 스택 컨벤션](../svelte/conventions.md)의 「모듈 레벨 상태 스토어」절을 참조합니다.

- Storybook test runner는 스토리를 순차 실행할 때 동일 모듈 인스턴스를 재사용합니다.
- reset 없으면 이전 스토리 상태가 유지됩니다.
