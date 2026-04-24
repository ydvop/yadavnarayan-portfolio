type EventName =
  | "video_play_intent"
  | "video_modal_open"
  | "video_swap"
  | "video_modal_close"
  | "video_error"
  | "category_filter";

export function trackEvent(
  name: EventName,
  props: Record<string, string | number | boolean>
) {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", name, props);
  }
}
