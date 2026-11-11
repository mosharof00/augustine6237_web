import { zodResolver } from "@hookform/resolvers/zod"
import { renderToStaticMarkup } from "react-dom/server"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusBadgeVariant } from "./status-badge"
import { toastSuccess } from "./toast"

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}))

const labels: Record<StatusBadgeVariant, string> = {
  active: "Active",
  inactive: "Inactive",
  invitation: "Invitation sent",
  pending: "Pending",
  published: "Published",
  draft: "Draft",
  expired: "Expired",
  new: "New",
  reviewing: "Reviewing",
  addressed: "Addressed",
}

describe("StatusBadge", () => {
  it("renders each variant's label", () => {
    for (const [variant, label] of Object.entries(labels) as Array<
      [StatusBadgeVariant, string]
    >) {
      const html = renderToStaticMarkup(<StatusBadge variant={variant} />)
      expect(html).toContain(label)
    }
  })
})

const requiredSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

function RequiredNameForm() {
  const form = useForm({
    resolver: zodResolver(requiredSchema),
    defaultValues: { name: "" },
  })
  const message = requiredSchema.safeParse({ name: "" }).error?.issues[0]?.message

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage>{message}</FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe("zod form", () => {
  it("shows a required-field message", async () => {
    const result = await zodResolver(requiredSchema)(
      { name: "" },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )
    expect(result.errors.name?.message).toBe("Name is required")
    const html = renderToStaticMarkup(<RequiredNameForm />)
    expect(html).toContain("Name is required")
  })
})

describe("toastSuccess", () => {
  it("is callable", () => {
    toastSuccess({ title: "Saved", description: "The change was saved." })
    expect(toast.success).toHaveBeenCalledWith("Saved", {
      description: "The change was saved.",
    })
  })
})
