interface CalWebhookPayload {
  triggerEvent: string;
  createdAt: string;
  payload: {
    bookingId?: number;
    uid?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    attendees?: Array<{
      email: string;
      name: string;
      timeZone: string;
    }>;
    eventType?: {
      slug: string;
      title: string;
    };
    status?: string;
  };
}

export function parseCalWebhook(body: CalWebhookPayload) {
  const { triggerEvent, payload } = body;

  switch (triggerEvent) {
    case "BOOKING_CREATED":
      return {
        type: "booking_created" as const,
        booking: {
          calBookingId: String(payload.uid || payload.bookingId),
          title: payload.title || "Meeting",
          startTime: payload.startTime || "",
          endTime: payload.endTime || "",
          attendeeEmail: payload.attendees?.[0]?.email || "",
          attendeeName: payload.attendees?.[0]?.name || "",
          eventType: payload.eventType?.slug || "default",
        },
      };

    case "BOOKING_CANCELLED":
      return {
        type: "booking_cancelled" as const,
        calBookingId: String(payload.uid || payload.bookingId),
      };

    case "BOOKING_RESCHEDULED":
      return {
        type: "booking_rescheduled" as const,
        booking: {
          calBookingId: String(payload.uid || payload.bookingId),
          startTime: payload.startTime || "",
          endTime: payload.endTime || "",
        },
      };

    case "MEETING_ENDED":
      return {
        type: "meeting_ended" as const,
        calBookingId: String(payload.uid || payload.bookingId),
      };

    case "RECORDING_TRANSCRIPTION_GENERATED":
      return {
        type: "transcription_ready" as const,
        calBookingId: String(payload.uid || payload.bookingId),
      };

    default:
      return { type: "unknown" as const, triggerEvent };
  }
}
