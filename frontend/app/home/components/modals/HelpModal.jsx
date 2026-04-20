import { HelpCircle, Info, MessageSquare, Mail, X } from "lucide-react";

const FAQS = [
  { q: "How do I create a custom short link?", a: "Enter your URL and add a custom slug. Only lowercase letters, numbers, hyphens, and underscores allowed." },
  { q: "Can I edit a link after creating it?", a: "Currently links cannot be edited. Create a new link with your desired changes." },
  { q: "How long do my links last?", a: "Links don't expire by default. Set an expiration date when creating advanced links." },
  { q: "How do I track link performance?", a: "Click 'Details' on any link to see comprehensive analytics." },
];

export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" /> Help & Support
          </h3>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" /> Frequently Asked Questions
            </h4>
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-2">{faq.q}</div>
                  <div className="text-sm text-slate-600">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" /> Contact Support
            </h4>
            <a href="mailto:support@linkhub.com" className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium text-slate-900">Email</div>
                <div className="text-sm text-slate-500">support@linkhub.com</div>
              </div>
            </a>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}