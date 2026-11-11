<script setup>
import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Physician (premium) — Doctor. Clinical two-column with publications and licences. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-gray-100 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
    <article class="max-width-1024 center-margin background-white round-corners-20 add-shadow-lg overflow-hidden print:no-shadow">
      <header :class="'add-padding-40 on-mobile:add-padding-24 ' + accent.soft">
        <div class="make-flex flex-wrap align-center gap-28">
          <Avatar :basics="basics" class="set-width-120 set-height-120 round-corners-20 add-shadow-md flex-shrink-0" :fallbackClass="'set-text-40 text-bold color-white ' + accent.solid" />
          <div class="flex-1 min-width-280">
            <p :class="'set-text-12 text-bold text-uppercase letter-space-widest ' + accent.text">{{ basics.title }}</p>
            <h1 class="set-text-40 on-mobile:set-text-28 text-extrabold color-gray-900 line-height-tight add-margin-top-4">{{ basics.name }}</h1>
            <p v-if="basics.summary" class="set-text-15 color-gray-700 line-height-relaxed add-margin-top-12 max-width-720">{{ basics.summary }}</p>
          </div>
        </div>
        <div v-if="has(stats)" class="make-flex flex-wrap gap-12 add-margin-top-28">
          <div v-for="s in stats" :key="s.label" class="background-white round-corners-12 add-padding-x-20 add-padding-y-12 add-shadow-sm">
            <span :class="'set-text-22 text-extrabold ' + accent.textStrong">{{ s.value }}</span>
            <span class="set-text-13 color-gray-600 add-margin-left-8">{{ s.label }}</span>
          </div>
        </div>
      </header>

      <div class="make-grid grid-cols-1 md:grid-cols-3">
        <aside class="add-padding-32 on-mobile:add-padding-24 add-border-right-1 border-color-gray-100">
          <section class="add-margin-bottom-32">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Contact</h2>
            <ul class="list-none add-padding-0 add-margin-0 set-text-14">
              <li v-for="c in contacts(basics)" :key="c.key" class="make-flex gap-10 add-margin-bottom-10"><span :class="accent.text">{{ c.icon }}</span><A :href="c.href" class="color-gray-700 text-no-decoration">{{ c.label }}</A></li>
              <li v-for="l in links" :key="l.url" class="make-flex gap-10 add-margin-bottom-10"><span :class="accent.text">↗</span><A :href="l.url" :class="'text-semibold text-no-decoration ' + accent.textStrong">{{ l.label }}</A></li>
            </ul>
          </section>
          <section v-if="has(certifications)" class="add-margin-bottom-32">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Licences</h2>
            <div v-for="(c, i) in certifications" :key="i" :class="'add-padding-left-12 add-border-left-2 add-margin-bottom-12 ' + accent.border">
              <p class="set-text-14 text-bold color-gray-900">{{ c.name }}</p>
              <p class="set-text-12 color-gray-500">{{ c.issuer }} · {{ c.year }}</p>
            </div>
          </section>
          <section v-if="has(skills)" class="add-margin-bottom-32">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Specialties</h2>
            <div class="make-flex flex-wrap gap-6">
              <span v-for="s in skills" :key="s.name" :class="'set-text-12 text-semibold add-padding-x-10 add-padding-y-4 round-corners-6 ' + accent.softer + ' ' + accent.textDeep">{{ s.name }}</span>
            </div>
          </section>
          <section v-if="has(languages)">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Languages</h2>
            <p v-for="l in languages" :key="l.name" class="make-flex justify-between set-text-14 color-gray-700 add-margin-bottom-6"><span>{{ l.name }}</span><span class="color-gray-400">{{ l.level }}</span></p>
          </section>
        </aside>

        <div class="md:span-col-2 add-padding-32 on-mobile:add-padding-24">
          <section v-if="has(experience)" class="add-margin-bottom-32">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Appointments</h2>
            <div v-for="(x, i) in experience" :key="i" class="add-margin-bottom-20 add-padding-bottom-20 add-border-bottom-1 border-color-gray-100 break-inside-avoid">
              <div class="make-flex flex-wrap justify-between gap-8">
                <h3 class="set-text-17 text-bold color-gray-900">{{ x.role }}</h3>
                <span class="set-text-13 text-semibold color-gray-500">{{ dateRange(x.start, x.end) }}</span>
              </div>
              <p :class="'set-text-14 text-semibold add-margin-bottom-8 ' + accent.text">{{ x.company }}<span v-if="x.location" class="color-gray-400 text-regular"> · {{ x.location }}</span></p>
              <ul class="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
                <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-4">{{ h }}</li>
              </ul>
            </div>
          </section>
          <section v-if="has(education)" class="add-margin-bottom-32">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Training &amp; education</h2>
            <div v-for="(e, i) in education" :key="i" class="make-flex flex-wrap justify-between gap-8 add-margin-bottom-10">
              <div>
                <p class="set-text-15 text-bold color-gray-900">{{ e.degree }}</p>
                <p class="set-text-13 color-gray-600">{{ e.school }}{{ e.details ? ' · ' + e.details : '' }}</p>
              </div>
              <span class="set-text-13 color-gray-500">{{ dateRange(e.start, e.end) }}</span>
            </div>
          </section>
          <section v-if="has(projects)">
            <h2 class="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + accent.solid">+</span>Selected publications</h2>
            <ol class="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
              <li v-for="(p, i) in projects" :key="i" class="add-margin-bottom-8"><A :href="p.url" class="text-bold color-gray-900 text-no-decoration">{{ p.name }}</A>. <span class="text-italic">{{ p.description }}</span></li>
            </ol>
          </section>
        </div>
      </div>
    </article>
  </main>
</template>
