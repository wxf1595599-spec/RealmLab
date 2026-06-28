package agent

import "testing"

func TestUserPreviewTextUsesMemoryCompilerSourceEvent(t *testing.T) {
	content := `<memory-compiler-execution>
{
  "type": "memory_v5_execution_contract",
  "planner_ir": {
    "source_event": "继续修复左侧标题显示"
  }
}
</memory-compiler-execution>`

	if got := UserPreviewText(content); got != "继续修复左侧标题显示" {
		t.Fatalf("UserPreviewText() = %q", got)
	}
}

func TestStripTransientUserBlocksStripsMemoryCompilerExecution(t *testing.T) {
	content := "<memory-compiler-execution>\nnot json\n</memory-compiler-execution>\n\n继续工作"

	if got := StripTransientUserBlocks(content); got != "继续工作" {
		t.Fatalf("StripTransientUserBlocks() = %q", got)
	}
}
