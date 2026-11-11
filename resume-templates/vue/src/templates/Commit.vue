<script setup>
import { dateRange } from '@shared/format.js';
import { A, contacts, has, templateProps, useResume } from './parts.js';

/** Commit — Software Engineer. Terminal header, monospace labels, stack chips. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-slate-200 add-padding-y-40 on-mobile:add-padding-y-0">
    <article class="max-width-960 center-margin background-white add-shadow-xl round-corners-16 overflow-hidden print:no-shadow">
      <header class="background-slate-900 color-white add-padding-40 on-mobile:add-padding-24">
        <div class="make-flex gap-8 add-margin-bottom-24" aria-hidden="true">
          <span class="set-width-12 set-height-12 make-circle background-red-400" />
          <span class="set-width-12 set-height-12 make-circle background-amber-400" />
          <span class="set-width-12 set-height-12 make-circle background-green-400" />
        </div>
        <p :class="'font-mono set-text-14 add-margin-bottom-8 ' + accent.textBright">~/resume $ whoami</p>
        <h1 class="set-text-44 on-mobile:set-text-28 text-extrabold line-height-tight letter-space-tight">{{ basics.name }}</h1>
        <p :class="'set-text-20 on-mobile:set-text-16 add-margin-top-8 ' + accent.textMuted">{{ basics.title }}</p>
        <ul class="list-none add-padding-0 add-margin-0 add-margin-top-20 make-flex flex-wrap gap-x-24 gap-y-8 font-mono set-text-13 color-slate-300">
          <li v-for="c in contacts(basics)" :key="c.key">
            <A :href="c.href" class="color-slate-300 text-no-decoration on-hover:color-white"><span :class="accent.textBright">{{ c.icon }}</span> {{ c.label }}</A>
          </li>
          <li v-for="l in links" :key="l.url">
            <A :href="l.url" class="color-slate-300 text-no-decoration on-hover:color-white"><span :class="accent.textBright">@</span>{{ l.label }}</A>
          </li>
        </ul>
      </header>

      <div v-if="has(stats)" class="make-flex flex-wrap add-border-bottom-1 border-color-slate-200">
        <div v-for="s in stats" :key="s.label" class="flex-1 min-width-140 add-padding-x-24 add-padding-y-20 add-border-right-1 border-color-slate-200">
          <p :class="'set-text-28 text-extrabold font-mono ' + accent.text">{{ s.value }}</p>
          <p class="set-text-12 color-slate-500 text-uppercase letter-space-wide add-margin-top-4">{{ s.label }}</p>
        </div>
      </div>

      <div class="make-grid grid-cols-1 md:grid-cols-3">
        <div class="md:span-col-2 add-padding-40 on-mobile:add-padding-24">
          <section v-if="basics.summary" class="add-margin-bottom-36">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// readme</h2>
            <p class="set-text-15 color-slate-700 line-height-relaxed">{{ basics.summary }}</p>
          </section>

          <section v-if="has(experience)" class="add-margin-bottom-36">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// experience</h2>
            <div v-for="(x, i) in experience" :key="i" :class="'add-padding-left-20 add-border-left-2 add-padding-bottom-24 break-inside-avoid ' + accent.borderSoft">
              <div class="make-flex flex-wrap justify-between align-start gap-8">
                <div>
                  <h3 class="set-text-17 text-bold color-slate-900">{{ x.role }}</h3>
                  <p :class="'set-text-15 text-semibold ' + accent.text">{{ x.company }}<span v-if="x.location" class="color-slate-400 text-regular"> · {{ x.location }}</span></p>
                </div>
                <span class="font-mono set-text-12 color-slate-600 background-slate-100 add-padding-x-10 add-padding-y-4 round-corners-6">{{ dateRange(x.start, x.end) }}</span>
              </div>
              <ul class="list-none add-padding-0 add-margin-0 add-margin-top-10">
                <li v-for="(h, j) in x.highlights" :key="j" class="make-flex gap-10 set-text-14 color-slate-600 line-height-relaxed add-margin-bottom-6">
                  <span :class="'font-mono flex-shrink-0 ' + accent.text">›</span>
                  <span>{{ h }}</span>
                </li>
              </ul>
            </div>
          </section>

          <section v-if="has(projects)">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// projects</h2>
            <div class="make-grid grid-cols-1 md:grid-cols-2 gap-16">
              <div v-for="(p, i) in projects" :key="i" class="add-border-1 border-color-slate-200 round-corners-12 add-padding-20 break-inside-avoid">
                <A :href="p.url" class="set-text-15 text-bold color-slate-900 text-no-decoration font-mono">{{ p.name }}</A>
                <p class="set-text-13 color-slate-600 line-height-relaxed add-margin-top-6">{{ p.description }}</p>
                <div class="make-flex flex-wrap gap-6 add-margin-top-12">
                  <span v-for="t in p.tags" :key="t" :class="'font-mono set-text-11 add-padding-x-8 add-padding-y-2 round-corners-4 ' + accent.soft + ' ' + accent.textStrong">{{ t }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="background-slate-50 add-padding-32 on-mobile:add-padding-24 add-border-left-1 border-color-slate-200">
          <section v-if="has(skills)" class="add-margin-bottom-32">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// stack</h2>
            <div class="make-flex flex-wrap gap-8">
              <span v-for="s in skills" :key="s.name" class="font-mono set-text-13 color-slate-800 background-white add-border-1 border-color-slate-300 add-padding-x-10 add-padding-y-4 round-corners-6">{{ s.name }}</span>
            </div>
          </section>
          <section v-if="has(education)" class="add-margin-bottom-32">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// education</h2>
            <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-16">
              <p class="set-text-14 text-bold color-slate-900">{{ e.degree }}</p>
              <p class="set-text-13 color-slate-600">{{ e.school }}</p>
              <p class="font-mono set-text-12 color-slate-500 add-margin-top-2">{{ dateRange(e.start, e.end) }}{{ e.details ? ' · ' + e.details : '' }}</p>
            </div>
          </section>
          <section v-if="has(certifications)" class="add-margin-bottom-32">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// certs</h2>
            <div v-for="(c, i) in certifications" :key="i" class="add-margin-bottom-12">
              <p class="set-text-13 text-semibold color-slate-900">{{ c.name }}</p>
              <p class="set-text-12 color-slate-500">{{ c.issuer }} · {{ c.year }}</p>
            </div>
          </section>
          <section v-if="has(languages)">
            <h2 :class="'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + accent.text">// languages</h2>
            <div v-for="l in languages" :key="l.name" class="make-flex justify-between set-text-13 add-margin-bottom-6">
              <span class="color-slate-800">{{ l.name }}</span>
              <span class="font-mono color-slate-500">{{ l.level }}</span>
            </div>
          </section>
        </aside>
      </div>
    </article>
  </main>
</template>
