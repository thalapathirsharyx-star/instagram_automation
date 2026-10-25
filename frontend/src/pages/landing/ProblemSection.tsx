import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, RefreshCw, Image, Mic, Smile } from 'lucide-react';

/**
 * The minutes a lead spends waiting are the argument this section is making, so
 * they are the thing the layout shows. The phone carries the silence and the
 * panel beside it carries the clock, reading the same moment from two sides.
 */

type Tone = 'calm' | 'warn' | 'hot' | 'stop' | 'brand';

const TONE: Record<Tone, { text: string; dot: string; rail: string; chip: string }> = {
  calm: { text: 'text-emerald-500', dot: 'bg-emerald-500', rail: 'border-emerald-500', chip: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
  warn: { text: 'text-amber-500', dot: 'bg-amber-500', rail: 'border-amber-500', chip: 'border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
  hot: { text: 'text-orange-500', dot: 'bg-orange-500', rail: 'border-orange-500', chip: 'border-orange-500/25 bg-orange-500/5 text-orange-600 dark:text-orange-400' },
  stop: { text: 'text-rose-500', dot: 'bg-rose-500', rail: 'border-rose-500', chip: 'border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400' },
  brand: { text: 'text-[#4F39F6] dark:text-[#818CF8]', dot: 'bg-[#4F39F6] dark:bg-[#818CF8]', rail: 'border-[#4F39F6]', chip: 'border-[#4F39F6]/25 bg-[#4F39F6]/5 text-[#4F39F6] dark:text-[#818CF8]' },
};

/** What the wait costs, minute by minute. A real sequence, so it is timestamped. */
const WAITING_LOG = [
  { at: '00:00', text: 'Alex asks what you charge' },
  { at: '00:30', text: 'Message still unread' },
  { at: '01:00', text: 'They open two competitors' },
  { at: '03:00', text: 'Interest drops off sharply' },
  { at: '05:00', text: 'They buy somewhere else' },
];

/** The same conversation once Flazly is answering it. */
const AUTOPILOT_LOG = [
  { at: '0:02', text: 'Flazly answers the pricing question' },
  { at: '0:15', text: 'Asks what they actually need' },
  { at: '0:34', text: 'Captures their email' },
  { at: '0:52', text: 'Sends a link to book a call' },
];

export const ProblemStorytelling: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });
  const [scene, setScene] = useState(1);
  const [timer, setTimer] = useState('00:00');
  const [showAiReply, setShowAiReply] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(setTimeout(fn, delay));
    };

    const runAnimation = () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];

      // Scene 1: New Lead Arrives. Scheduled rather than set inline so the
      // reset does not run synchronously inside the effect body.
      schedule(() => {
        setScene(1);
        setTimer('00:00');
        setShowAiReply(false);
        setShowTyping(false);
      }, 0);

      // Scene 2: Waiting
      schedule(() => {
        setScene(2);
        setTimer('00:00');
      }, 2500);

      schedule(() => { setTimer('00:30'); }, 3300);
      schedule(() => { setTimer('01:00'); }, 4100);
      schedule(() => { setTimer('03:00'); }, 4900);
      schedule(() => { setTimer('05:00'); }, 5700);

      // Scene 3: Lost Opportunity
      schedule(() => {
        setScene(3);
        setTimer('05:00');
      }, 6200);

      // Scene 4: Time Rewinds
      schedule(() => {
        setScene(4);
        setTimer('—');
      }, 8700);

      // Scene 5: Instant AI Response
      schedule(() => {
        setScene(5);
        setTimer('0:02');
        setShowTyping(true);
      }, 10500);

      schedule(() => {
        setShowTyping(false);
        setShowAiReply(true);
      }, 11500);

      // Scene 6: Automated Workflow
      schedule(() => { setScene(6); }, 13000);

      // Scene 7: Conversion
      schedule(() => { setScene(7); }, 16000);
    };

    runAnimation();
    const interval = setInterval(runAnimation, 19500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [isInView]);

  const isAutopilot = scene >= 5;
  const waitIndex = WAITING_LOG.findIndex(entry => entry.at === timer);
  const autopilotShown = scene >= 7 ? 4 : scene === 6 ? 3 : scene === 5 ? 1 : 0;

  const tone: Tone =
    scene === 1 ? 'calm'
      : scene === 2 && (timer === '00:00' || timer === '00:30') ? 'warn'
        : scene === 2 && timer === '01:00' ? 'warn'
          : scene === 2 && timer === '03:00' ? 'hot'
            : scene === 2 || scene === 3 ? 'stop'
              : scene === 4 ? 'brand'
                : 'calm';

  const statusLabel =
    scene === 1 ? 'Message received'
      : scene === 2 && (timer === '00:00' || timer === '00:30' || timer === '01:00') ? 'Waiting on you'
        : scene === 2 && timer === '03:00' ? 'Losing interest'
          : scene === 2 || scene === 3 ? 'Lost'
            : scene === 4 ? 'Replaying with Flazly'
              : scene === 5 ? 'Flazly replied'
                : scene === 6 ? 'Qualifying'
                  : 'Call booked';

  const presence =
    scene === 1 ? { label: 'Active now', tone: 'calm' as Tone }
      : scene === 2 ? { label: `Active ${timer} ago`, tone }
        : scene === 3 ? { label: 'Gone', tone: 'stop' as Tone }
          : scene === 4 ? { label: 'Replaying', tone: 'brand' as Tone }
            : { label: 'Flazly is answering', tone: 'brand' as Tone };

  return (
    <div ref={sectionRef} className="grid lg:grid-cols-12 gap-6 lg:gap-8 mt-14 w-full text-zinc-900 dark:text-white">

      {/* The phone. Equal height with the panel so the two line up top and
          bottom and read as one moment rather than two loose cards. */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="mockup-dark w-full max-w-[340px] lg:h-[520px] h-[460px] rounded-[28px] border border-zinc-800 bg-[#09090b] text-white flex flex-col relative overflow-hidden">

          <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[10px] font-semibold text-zinc-500 select-none shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-4 h-2 rounded-[2px] border border-zinc-600 flex items-center p-[1px]">
                <div className="w-full h-full bg-zinc-500 rounded-[1px]" />
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-900 py-3 px-4 flex items-center gap-2.5 shrink-0 z-10">
            <ChevronLeft size={18} className="text-zinc-400 shrink-0" />
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#121214] flex items-center justify-center text-[9px] font-semibold text-white">
                  AR
                </div>
              </div>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[13px] font-semibold text-white leading-tight">alex.rivera</span>
              <span className={`text-[11px] leading-tight flex items-center gap-1.5 ${TONE[presence.tone].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE[presence.tone].dot}`} />
                {presence.label}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-black px-4 py-4 overflow-hidden flex flex-col gap-2.5 text-left relative">
            <AnimatePresence mode="popLayout">
              {scene === 4 && (
                <motion.div
                  key="rewind"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 gap-3 z-20"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  >
                    <RefreshCw size={26} className="text-[#818CF8]" />
                  </motion.div>
                  <span className="text-[13px] font-medium text-[#818CF8]">Same message, with Flazly</span>
                </motion.div>
              )}

              {scene !== 4 && (
                <motion.div
                  key="customer-msg"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col max-w-[85%] self-start shrink-0"
                >
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-zinc-900 text-zinc-100 border border-zinc-800">
                    Hi, I'm interested in your service. Can you share pricing?
                  </div>
                </motion.div>
              )}

              {/* The dead air is the point, so it is drawn rather than left as
                  blank space that reads like an unfinished mockup. */}
              {scene === 2 && (
                <motion.div
                  key="silence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-stretch gap-3 pl-1 pt-1 min-h-0"
                >
                  <div className="w-px bg-[repeating-linear-gradient(to_bottom,#3f3f46_0_4px,transparent_4px_10px)] shrink-0" />
                  <span className={`text-[12px] self-center ${TONE[tone].text}`}>
                    No reply for {timer}
                  </span>
                </motion.div>
              )}

              {scene === 3 && (
                <motion.div
                  key="gone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 min-h-0"
                >
                  <span className="text-[13px] font-medium text-rose-500">Alex stopped waiting</span>
                  <span className="text-[12px] text-zinc-500">They bought from someone who replied</span>
                </motion.div>
              )}

              {isAutopilot && showTyping && (
                <motion.div
                  key="ai-typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="self-end shrink-0"
                >
                  <div className="bg-[#4F39F6]/20 border border-[#4F39F6]/30 px-3.5 py-3 rounded-2xl rounded-tr-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              {isAutopilot && showAiReply && (
                <motion.div
                  key="ai-reply"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col max-w-[88%] self-end shrink-0"
                >
                  <div className="bg-[#4F39F6] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[13px] leading-relaxed">
                    Thanks for reaching out. Plans start at $49/mo. What are you hoping to automate?
                  </div>
                </motion.div>
              )}

              {scene >= 6 && (
                <motion.div
                  key="customer-reply"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col max-w-[85%] self-start shrink-0"
                >
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-zinc-900 text-zinc-100 border border-zinc-800">
                    Lead gen for my D2C brand.
                  </div>
                </motion.div>
              )}

              {scene >= 6 && (
                <motion.div
                  key="ai-followup"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col max-w-[88%] self-end shrink-0"
                >
                  <div className="bg-[#4F39F6] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[13px] leading-relaxed">
                    Perfect. What's the best email to send details to?
                  </div>
                </motion.div>
              )}

              {scene >= 7 && (
                <motion.div
                  key="customer-email"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col max-w-[85%] self-start shrink-0"
                >
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-zinc-900 text-zinc-100 border border-zinc-800">
                    alex@riveramedia.co
                  </div>
                </motion.div>
              )}

              {scene >= 7 && (
                <motion.div
                  key="ai-capture"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex flex-col max-w-[88%] self-end shrink-0"
                >
                  <div className="bg-[#4F39F6] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[13px] leading-relaxed">
                    Sent. Here's a link if you'd like to talk it through: flazly.com/book
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-3 bg-[#09090b] border-t border-zinc-900 flex items-center gap-2 shrink-0 z-10">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full h-9 px-3.5 flex items-center justify-between text-[12px] text-zinc-500 select-none">
              <span>Message…</span>
              <div className="flex items-center gap-2.5">
                <Mic size={13} />
                <Image size={13} />
                <Smile size={13} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The clock. Same height as the phone, and the log grows as the minutes
          pass so the panel is never a tall box with a hole in the middle. */}
      <div className="lg:col-span-7">
        <div className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 rounded-2xl lg:h-[520px] flex flex-col overflow-hidden">

          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-100 dark:border-white/5">
            <span className="text-[13px] text-zinc-500 dark:text-zinc-400">One lead, one question</span>
            <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[13px] font-medium ${TONE[tone].chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${TONE[tone].dot}`} />
              {statusLabel}
            </span>
          </div>

          <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5">
            <div className="flex items-baseline gap-3">
              <span className={`text-[56px] leading-none font-semibold tracking-tight tabular-nums ${isAutopilot ? 'text-emerald-500' : TONE[tone].text}`}>
                {timer}
              </span>
              <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
                {isAutopilot ? 'to first reply' : scene === 4 ? '' : 'and still no answer'}
              </span>
            </div>
          </div>

          {/* The sequence. Each entry lands as its minute arrives, so the space
              fills with the argument instead of sitting empty. */}
          <div className="flex-1 min-h-0 overflow-hidden px-6 py-5">
            <ol className="flex flex-col">
              {(isAutopilot ? AUTOPILOT_LOG : WAITING_LOG).map((entry, index) => {
                const reached = isAutopilot
                  ? index < autopilotShown
                  : scene >= 3 ? true : index <= Math.max(waitIndex, 0);
                const isLatest = isAutopilot
                  ? index === autopilotShown - 1
                  : index === waitIndex;
                const entryTone: Tone = isAutopilot ? 'calm' : index >= 3 ? 'stop' : index >= 1 ? 'warn' : 'calm';

                return (
                  <li
                    key={entry.at}
                    className={`flex items-center gap-3 py-2 border-l-2 pl-4 transition-colors duration-500 ${
                      reached ? (isLatest ? TONE[entryTone].rail : 'border-zinc-200 dark:border-white/10') : 'border-zinc-100 dark:border-white/5'
                    }`}
                  >
                    <span className={`text-[13px] tabular-nums w-11 shrink-0 ${reached ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-700'}`}>
                      {entry.at}
                    </span>
                    <span className={`text-[14px] transition-colors duration-500 ${
                      reached
                        ? isLatest ? `font-medium ${TONE[entryTone].text}` : 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}>
                      {entry.text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/5">
            <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {isAutopilot
                ? 'Flazly answered in under two seconds, found out what they needed, and put a call in your calendar. You read the transcript afterwards.'
                : scene === 3
                  ? 'Nothing here needed a person. It only needed an answer, and there was nobody free to give one.'
                  : 'Most buyers message three or four businesses at once. The one that answers first usually keeps them.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-[46ch]">
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.08]">
            Every unanswered DM is somebody else's customer.
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Your next buyer is in your inbox right now, asking what you charge. Here is what
            the next five minutes cost you.
          </p>
        </div>

        <ProblemStorytelling />
      </div>
    </section>
  );
};

export default ProblemSection;
