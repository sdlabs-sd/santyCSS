<script setup>
import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Boardroom (premium) — Chief Executive. Dark luxe cover panel, leadership metrics. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-neutral-900 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
    <article class="max-width-1024 center-margin background-white overflow-hidden add-shadow-xl make-grid grid-cols-1 md:grid-cols-3 print:no-shadow">
      <aside class="background-neutral-900 color-white add-padding-40 on-mobile:add-padding-24 position-relative">
        <div :class="'position-absolute pin-top-0 pin-left-0 pin-right-0 set-height-4 ' + accent.bar" />
        <Avatar :basics="basics" :class="'set-width-140 set-height-140 make-circle add-border-2 add-margin-bottom-24 ' + accent.borderMid" :fallbackClass="'font-serif set-text-48 background-neutral-800 ' + accent.textBright" />
        <h1 class="font-serif set-text-36 text-bold line-height-tight">{{ basics.name }}</h1>
        <p :class="'set-text-13 text-bold text-uppercase letter-space-widest add-margin-top-12 ' + accent.textBright">{{ basics.title }}</p>
        <div :class="'set-width-48 set-height-1 add-margin-y-28 ' + accent.bar" />

        <ul class="list-none add-padding-0 add-margin-0 set-text-14 add-margin-bottom-32">
          <li v-for="c in contacts(basics)" :key="c.key" class="add-margin-bottom-10"><A :href="c.href" class="color-neutral-300 text-no-decoration on-hover:color-white">{{ c.label }}</A></li>
          <li v-for="l in links" :key="l.url" class="add-margin-bottom-10"><A :href="l.url" :class="'text-no-decoration ' + accent.textBright">{{ l.label }} →</A></li>
        </ul>

        <section v-if="has(skills)" class="add-margin-bottom-32">
          <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-500 add-margin-bottom-12">Leadership</h2>
          <p v-for="s in skills" :key="s.name" class="set-text-14 color-neutral-200 add-padding-y-6 add-border-bottom-1 border-color-neutral-800">{{ s.name }}</p>
        </section>
        <section v-if="has(education)" class="add-margin-bottom-32">
          <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-500 add-margin-bottom-12">Education</h2>
          <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-12">
            <p class="font-serif set-text-16 color-white">{{ e.degree }}</p>
            <p class="set-text-13 color-neutral-400">{{ e.school }} · {{ e.end }}</p>
          </div>
        </section>
        <section v-if="has(certifications) || has(languages)">
          <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-500 add-margin-bottom-12">Boards &amp; languages</h2>
          <p v-for="(c, i) in certifications" :key="i" class="set-text-13 color-neutral-300 add-margin-bottom-6">{{ c.name }}</p>
          <p v-for="l in languages" :key="l.name" class="set-text-13 color-neutral-300 add-margin-bottom-6">{{ l.name }} — {{ l.level }}</p>
        </section>
      </aside>

      <div class="md:span-col-2 add-padding-48 on-mobile:add-padding-24">
        <section v-if="basics.summary" class="add-margin-bottom-40">
          <h2 :class="'font-serif set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-20 ' + accent.text">Executive profile</h2>
          <p class="font-serif set-text-20 on-mobile:set-text-18 color-neutral-800 line-height-relaxed">{{ basics.summary }}</p>
        </section>
        <div v-if="has(stats)" class="make-grid grid-cols-2 gap-1 background-neutral-200 add-border-1 border-color-neutral-200 add-margin-bottom-40">
          <div v-for="s in stats" :key="s.label" class="background-white add-padding-24">
            <p :class="'font-serif set-text-40 text-bold line-height-tight ' + accent.textStrong">{{ s.value }}</p>
            <p class="set-text-12 text-bold text-uppercase letter-space-wider color-neutral-500 add-margin-top-6">{{ s.label }}</p>
          </div>
        </div>
        <section v-if="has(experience)" class="add-margin-bottom-32">
          <h2 :class="'font-serif set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-20 ' + accent.text">Career</h2>
          <div v-for="(x, i) in experience" :key="i" class="add-margin-bottom-28 break-inside-avoid">
            <p class="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-400">{{ dateRange(x.start, x.end) }}</p>
            <h3 class="font-serif set-text-22 text-bold color-neutral-900 add-margin-top-4">{{ x.role }}</h3>
            <p :class="'set-text-15 text-semibold ' + accent.textStrong">{{ x.company }}<span v-if="x.location" class="color-neutral-400 text-regular"> — {{ x.location }}</span></p>
            <ul class="list-none add-padding-0 add-margin-0 add-margin-top-10">
              <li v-for="(h, j) in x.highlights" :key="j" class="make-flex gap-12 set-text-15 color-neutral-700 line-height-relaxed add-margin-bottom-6">
                <span :class="'set-width-12 set-height-1 add-margin-top-12 flex-shrink-0 ' + accent.bar" /><span>{{ h }}</span>
              </li>
            </ul>
          </div>
        </section>
        <section v-if="has(projects)">
          <h2 :class="'font-serif set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-20 ' + accent.text">Selected initiatives</h2>
          <p v-for="(p, i) in projects" :key="i" class="set-text-15 color-neutral-700 add-margin-bottom-8"><span class="text-bold color-neutral-900">{{ p.name }}.</span> {{ p.description }}</p>
        </section>
      </div>
    </article>
  </main>
</template>
