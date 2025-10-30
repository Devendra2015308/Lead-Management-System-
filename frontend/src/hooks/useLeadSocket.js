import { useEffect } from "react";
import { socket } from "../utils/socket";

export default function useLeadSocket({ onNewLead, onLeadUpdate }) {
  useEffect(() => {
    // Listen for new lead (admins)
    socket.on("new_lead", (lead) => {
      if (onNewLead) onNewLead(lead);
    });

    // Listen for updates like assign/unassign/update status
    socket.on("lead_updated", (lead) => {
      if (onLeadUpdate) onLeadUpdate(lead);
    });

    return () => {
      socket.off("new_lead");
      socket.off("lead_updated");
    };
  }, [onNewLead, onLeadUpdate]);
}
