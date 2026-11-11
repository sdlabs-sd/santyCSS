<script setup>
import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Spotlight — Marketing Manager. Bold colour band with campaign numbers. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-white">
    <header :class="'add-padding-y-56 add-padding-x-24 on-mobile:add-padding-y-40 ' + accent.solid">
      <div class="max-width-1024 center-margin make-flex flex-wrap align-center gap-32">
        <Avatar :basics="basics" class="set-width-140 set-height-140 make-circle add-border-8 border-color-white add-shadow-lg flex-shrink-0" :fallbackClass="'set-text-48 text-extrabold background-white ' + accent.text" />
        <div class="flex-1 min-width-280 color-white">
          <p class="set-text-14 text-bold text-uppercase letter-space-widest opacity-80">{{ basics.title }}</p>
          <h1 class="set-text-56 on-mobile:set-text-36 text-extrabold line-height-tight letter-space-tight add-margin-top-8">{{ basics.name }}</h1>
          <ul class="list-none add-padding-0 add-margin-0 make-flex flex-wrap gap-x-20 gap-y-6 add-margin-top-16 set-text-14">
            <li v-for="c in contacts(basics)" :key="c.key"><A :href="c.href" class="color-white text-no-decoration opacity-90 on-hover:opacity-100">{{ c.icon }} {{ c.label }}</A></li>
          </ul>
        </div>
      </div>
    </header>

    <div v-if="has(stats)" class="max-width-1024 center-margin add-padding-x-24 subtract-margin-top-32 position-relative">
      <div class="make-grid grid-cols-2 md:grid-cols-4 background-white round-corners-20 add-shadow-xl overflow-hidden add-border-1 border-color-gray-100">
        <div v-for="s in stats" :key="s.label" class="add-padding-24 text-center add-border-right-1 border-color-gray-100">
          <p :class="'set-text-36 text-extrabold line-height-tight ' + accent.text">{{ s.value }}</p>
          <p class="set-text-13 text-semibold color-gray-500 add-margin-top-4">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <div class="max-width-1024 center-margin add-padding-x-24 add-padding-y-56 on-mobile:add-padding-y-40">
      <p v-if="basics.summary" class="set-text-20 on-mobile:set-text-18 color-gray-700 line-height-relaxed max-width-840 add-margin-bottom-48">{{ basics.summary }}</p>
      <div class="make-grid grid-cols-1 md:grid-cols-3 gap-48">
        <div class="md:span-col-2">
          <section v-if="has(experience)" class="add-margin-bottom-40">
            <h2 class="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20"><span :class="'set-width-24 set-height-4 make-pill ' + accent.bar" />Experience</h2>
            <div v-for="(x, i) in experience" :key="i" :class="'round-corners-16 add-padding-24 add-margin-bottom-16 break-inside-avoid ' + accent.soft">
              <div class="make-flex flex-wrap justify-between gap-8 align-start">
                <div>
                  <h3 class="set-text-18 text-extrabold color-gray-900">{{ x.role }}</h3>
                  <p :class="'set-text-15 text-bold ' + accent.textStrong">{{ x.company }}</p>
                </div>
                <span class="set-text-13 text-semibold color-gray-600 background-white add-padding-x-12 add-padding-y-4 make-pill">{{ dateRange(x.start, x.end) }}</span>
              </div>
              <ul class="list-none add-padding-0 add-margin-0 add-margin-top-12">
                <li v-for="(h, j) in x.highlights" :key="j" class="make-flex gap-10 set-text-14 color-gray-700 line-height-relaxed add-margin-bottom-6">
                  <span :class="'text-extrabold flex-shrink-0 ' + accent.text">★</span><span>{{ h }}</span>
                </li>
              </ul>
            </div>
          </section>
          <section v-if="has(projects)">
            <h2 class="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20"><span :class="'set-width-24 set-height-4 make-pill ' + accent.bar" />Campaigns</h2>
            <div v-for="(p, i) in projects" :key="i" class="add-border-left-4 add-padding-left-16 add-margin-bottom-16 border-color-gray-200">
              <A :href="p.url" class="set-text-16 text-bold color-gray-900 text-no-decoration">{{ p.name }}</A>
              <p class="set-text-14 color-gray-600">{{ p.description }}</p>
            </div>
          </section>
        </div>
        <aside>
          <section v-if="has(skills)" class="add-margin-bottom-40">
            <h2 class="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20"><span :class="'set-width-24 set-height-4 make-pill ' + accent.bar" />Expertise</h2>
            <div class="make-flex flex-wrap gap-8">
              <span v-for="s in skills" :key="s.name" :class="'set-text-13 text-bold add-padding-x-14 add-padding-y-8 make-pill ' + accent.softer + ' ' + accent.textDeep">{{ s.name }}</span>
            </div>
          </section>
          <section v-if="has(education)" class="add-margin-bottom-40">
            <h2 class="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20"><span :class="'set-width-24 set-height-4 make-pill ' + accent.bar" />Education</h2>
            <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-12">
              <p class="set-text-15 text-bold color-gray-900">{{ e.degree }}</p>
              <p class="set-text-14 color-gray-600">{{ e.school }} · {{ dateRange(e.start, e.end) }}</p>
            </div>
          </section>
          <section v-if="has(certifications)" class="add-margin-bottom-40">
            <h2 class="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20"><span :class="'set-width-24 set-height-4 make-pill ' + accent.bar" />Certified</h2>
            <p v-for="(c, i) in certifications" :key="i" class="set-text-14 color-gray-700 add-margin-bottom-8">✓ {{ c.name }} <span class="color-gray-400">({{ c.year }})</span></p>
          </section>
          <section v-if="has(languages) || has(links)">
            <h2 class="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20"><span :class="'set-width-24 set-height-4 make-pill ' + accent.bar" />Elsewhere</h2>
            <p v-for="l in languages" :key="l.name" class="set-text-14 color-gray-700 add-margin-bottom-4">{{ l.name }} — {{ l.level }}</p>
            <div class="make-flex flex-wrap gap-8 add-margin-top-12">
              <A v-for="l in links" :key="l.url" :href="l.url" :class="'set-text-13 text-bold color-white add-padding-x-14 add-padding-y-6 make-pill text-no-decoration ' + accent.solid + ' ' + accent.solidHover">{{ l.label }} →</A>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </main>
</template>
