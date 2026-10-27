import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, RefreshCw, Image, Mic, Smile, Lightbulb } from 'lucide-react';

/**
 * The minutes a lead spends waiting are the argument this section is making, so
 * they are the thing the layout shows. The phone carries the silence and the
 * panel beside it carries the clock, reading the same moment from two sides.
 */

type Tone = 'calm' | 'warn' | 'hot' | 'stop' | 'brand';

// `text` sits on the dark phone; `ink` on the white card, darkened to keep 4.5:1.
const TONE: Record<Tone, { text: string; ink: string; dot: string; glow: string; chip: string; bar: string }> = {
  calm: { text: 'text-emerald-400', ink: 'text-[#047857]', dot: 'bg-emerald-500', glow: 'rgba(16, 185, 129, 0.35)', chip: 'bg-[#E6F3EC] text-[#047857]', bar: 'bg-emerald-500' },
  warn: { text: 'text-amber-400', ink: 'text-[#B45309]', dot: 'bg-amber-500', glow: 'rgba(245, 158, 11, 0.38)', chip: 'bg-[#FFF7E6] text-[#B45309]', bar: 'bg-amber-500' },
  hot: { text: 'text-orange-400', ink: 'text-[#C2410C]', dot: 'bg-orange-500', glow: 'rgba(249, 115, 22, 0.4)', chip: 'bg-[#FFF0E2] text-[#C2410C]', bar: 'bg-orange-500' },
  stop: { text: 'text-rose-400', ink: 'text-[#BE123C]', dot: 'bg-rose-500', glow: 'rgba(244, 63, 94, 0.4)', chip: 'bg-[#FCE8E5] text-[#BE123C]', bar: 'bg-rose-500' },
  brand: { text: 'text-[#8fb4ff]', ink: 'text-[#1463FF]', dot: 'bg-[#1463FF]', glow: 'rgba(20, 99, 255, 0.45)', chip: 'bg-[#E5F0FC] text-[#1463FF]', bar: 'bg-[#1463FF]' },
};

/** How far into the five minutes the lead is; the bar under the clock fills with it. */
const WAIT_PROGRESS: Record<string, number> = { '00:00': 2, '00:30': 10, '01:00': 20, '03:00': 60, '05:00': 100 };

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

  const progress = isAutopilot ? 1.5 : scene === 4 ? 0 : WAIT_PROGRESS[timer] ?? 0;
  const mood: Tone = isAutopilot ? 'calm' : tone;
  const withFlazly = scene >= 4;

  return (
    <div ref={sectionRef} className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center mt-12 md:mt-16 w-full text-left">

      {/* The phone, in a device frame, over a glow that takes the mood of the moment. */}
      <div className="lg:col-span-5 flex justify-center relative">
        <div
          aria-hidden="true"
          className="lp-problem-glow"
          style={{ background: `radial-gradient(closest-side, ${isAutopilot ? TONE.brand.glow : TONE[tone].glow}, transparent)` }}
        />
        <div className="lp-phone mockup-dark relative w-full max-w-[320px]">
          <div className="lp-phone-screen h-[520px] sm:h-[582px] flex flex-col">

            <div className="relative px-6 pt-3.5 pb-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 select-none shrink-0">
              <span>9:41</span>
              <span className="absolute left-1/2 top-2.5 -translate-x-1/2 w-[86px] h-[24px] rounded-full bg-black" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="w-5 h-2.5 rounded-[3px] border border-zinc-500 flex items-center p-[1px]">
                  <div className="w-3/4 h-full bg-zinc-300 rounded-[1px]" />
                </div>
              </div>
            </div>

            <div className="border-b border-white/[0.06] py-3 px-4 flex items-center gap-2.5 shrink-0 z-10">
              <ChevronLeft size={18} className="text-zinc-400 shrink-0" />
              <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0">
                <div className="w-full h-full rounded-full bg-[#121214] flex items-center justify-center text-[10px] font-semibold text-white">
                  AR
                </div>
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[14px] font-semibold text-white leading-tight">alex.rivera</span>
                <span className={`text-[11px] leading-tight mt-0.5 flex items-center gap-1.5 transition-colors duration-500 ${TONE[presence.tone].text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE[presence.tone].dot}`} />
                  {presence.label}
                </span>
              </div>
            </div>

            {/* Bottom-anchored like a real chat, so the newest message stays in view. */}
            <div className="flex-1 bg-black px-4 py-4 overflow-hidden flex flex-col justify-end gap-2.5 text-left relative">
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
                      <RefreshCw size={26} className="text-[#8fb4ff]" />
                    </motion.div>
                    <span className="text-[13px] font-medium text-[#8fb4ff]">Same message, with Flazly</span>
                  </motion.div>
                )}

                {scene !== 4 && (
                  <motion.div
                    key="customer-msg"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col max-w-[85%] self-start shrink-0"
                  >
                    <div className="px-3.5 py-2.5 rounded-[20px] rounded-bl-md text-[13px] leading-relaxed bg-[#26262c] text-zinc-100">
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
                    className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0"
                  >
                    <span className={`w-11 h-11 rounded-full border border-dashed flex items-center justify-center ${TONE[tone].text} border-current`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${TONE[tone].dot}`} />
                    </span>
                    <span className={`text-[12px] font-medium transition-colors duration-500 ${TONE[tone].text}`}>
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
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 min-h-0 text-center"
                  >
                    <span className="text-[14px] font-semibold text-rose-400">Alex stopped waiting</span>
                    <span className="text-[12px] text-zinc-400">They bought from someone who replied</span>
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
                    <div className="bg-[#1463FF]/25 px-3.5 py-3 rounded-[20px] rounded-br-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#8fb4ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#8fb4ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#8fb4ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    <div className="lp-phone-out px-3.5 py-2.5 rounded-[20px] rounded-br-md text-[13px] leading-relaxed">
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
                    <div className="px-3.5 py-2.5 rounded-[20px] rounded-bl-md text-[13px] leading-relaxed bg-[#26262c] text-zinc-100">
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
                    <div className="lp-phone-out px-3.5 py-2.5 rounded-[20px] rounded-br-md text-[13px] leading-relaxed">
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
                    <div className="px-3.5 py-2.5 rounded-[20px] rounded-bl-md text-[13px] leading-relaxed bg-[#26262c] text-zinc-100">
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
                    <div className="lp-phone-out px-3.5 py-2.5 rounded-[20px] rounded-br-md text-[13px] leading-relaxed">
                      Sent. Here's a link if you'd like to talk it through: flazly.com/book
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-3 pt-3 pb-4 bg-black border-t border-white/[0.06] flex items-center gap-2 shrink-0 z-10">
              <div className="flex-1 bg-[#1c1c21] rounded-full h-10 px-4 flex items-center justify-between text-[12px] text-zinc-400 select-none">
                <span>Message…</span>
                <div className="flex items-center gap-2.5">
                  <Mic size={14} />
                  <Image size={14} />
                  <Smile size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The clock. The log grows as the minutes pass, so the card is never a
          tall box with a hole in the middle. */}
      <div className="lg:col-span-7">
        <div className="lp-problem-card lg:h-[600px] flex flex-col overflow-hidden">

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 sm:px-7 pt-6 pb-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px] shrink-0">
                <span className="w-full h-full rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-[#0E0B3D]">AR</span>
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-[#0E0B3D] leading-tight">alex.rivera</span>
                <span className="block text-[13px] text-[#6c6f93] mt-0.5 whitespace-nowrap">One lead, one question</span>
              </span>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors duration-500 ${TONE[isAutopilot ? 'calm' : tone].chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${TONE[isAutopilot ? 'calm' : tone].dot}`} />
              {statusLabel}
            </span>
          </div>

          {/* Which version of the story is playing. */}
          <div className="px-5 sm:px-7">
            <div className="lp-problem-modes" aria-hidden="true">
              <span className={!withFlazly ? 'is-on is-without' : ''}>Without Flazly</span>
              <span className={withFlazly ? 'is-on is-with' : ''}>With Flazly</span>
            </div>
          </div>

          <div className="px-5 sm:px-7 pt-5 pb-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className={`lp-problem-clock tabular-nums transition-colors duration-500 ${TONE[mood].ink}`}>
                {timer}
              </span>
              <span className="text-[14px] text-[#6c6f93]">
                {isAutopilot ? 'to first reply' : scene === 4 ? '' : 'and still no answer'}
              </span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[#EEF1F7] overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width,background-color] duration-700 ease-out ${TONE[mood].bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* The sequence. Each entry lands as its minute arrives. */}
          <div className="flex-1 min-h-0 overflow-hidden px-5 sm:px-7 pb-4">
            <ol className="lp-problem-log">
              {(isAutopilot ? AUTOPILOT_LOG : WAITING_LOG).map((entry, index) => {
                const reached = isAutopilot
                  ? index < autopilotShown
                  : scene >= 3 ? true : index <= Math.max(waitIndex, 0);
                const isLatest = isAutopilot
                  ? index === autopilotShown - 1
                  : index === waitIndex;
                const entryTone: Tone = isAutopilot ? 'calm' : index >= 3 ? 'stop' : index >= 1 ? 'warn' : 'calm';

                return (
                  <li key={entry.at} className={`flex items-center gap-4 py-2 transition-opacity duration-500 ${reached ? 'opacity-100' : 'opacity-40'}`}>
                    <span className="relative z-[1] flex items-center justify-center w-[18px] shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${reached ? TONE[entryTone].dot : 'bg-[#D5DAE6]'} ${isLatest ? 'lp-problem-ping' : ''}`} />
                    </span>
                    <span className="text-[13px] tabular-nums w-11 shrink-0 text-[#6c6f93]">{entry.at}</span>
                    <span className={`text-[15px] transition-colors duration-500 ${
                      isLatest && reached ? `font-semibold ${TONE[entryTone].ink}` : 'text-[#26245a]'
                    }`}>
                      {entry.text}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 rounded-2xl bg-[#F7F9FC] px-5 py-4 flex gap-3">
            <Lightbulb size={18} className="text-[#1463FF] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[14px] leading-relaxed text-[#535479]">
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
    <section className="py-16 md:py-24 relative px-4 sm:px-6">
      <div className="lp-problem-stage max-w-6xl mx-auto px-3 py-14 sm:px-10 md:px-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto px-2 sm:px-0">
          <span className="lp-eyebrow is-orange">The Cost Of Waiting</span>
          <h2 className="lp-title text-[34px] md:text-[48px] mt-3">
            Every unanswered DM is somebody else's customer.
          </h2>
          <p className="mt-5 text-[16px] md:text-[18px] text-[#535479] leading-relaxed">
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
