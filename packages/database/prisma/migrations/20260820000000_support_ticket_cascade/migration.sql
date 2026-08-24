-- AlterTable: SupportTicket.reporter + SupportTicketMessage.author now cascade on user deletion
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_reporterId_fkey";
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_ticket_messages" DROP CONSTRAINT "support_ticket_messages_authorId_fkey";
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
