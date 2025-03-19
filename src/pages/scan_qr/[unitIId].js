import React from "react";
import styles from "./mainMob.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { style } from "@mui/system";
import NeoHeader from "../neoMobHeader/NeoHeader";
import NeoFooter from "../neoMobFooter/NeoFooter";

const MainPage = () => {
  const router = useRouter();

  // ✅ Navigate to the next page with unitId
  const [unitId, setUnitId] = useState();

  // Extract ID from the path parameter instead of query
  useEffect(() => {
    if (router.isReady && router.pathname.includes("/scan_qr/")) {
      // Extract the ID from the path
      const pathId = router.asPath.split("/").pop();
      setUnitId(pathId);
      console.log("Scanned Unit ID:", pathId);
    }
  }, [router.isReady, router.asPath]);

  // Navigate to the next page with unitId
  const handleBookNow = () => {
    if (unitId) {
      router.push(`/scan_unit/${unitId}`); // For path-based routing
    } else {
      console.log("Unit ID is not available yet.");
    }
  };
  return (
    <>
      <div className={styles.wrapMain}>
        <NeoHeader />
        <div className={styles.requestNowPage1}>
          <div className={styles.requestNowPage1Child} />
          <section className={styles.frameParent}>
            <div className={styles.frameGroup}>
              <div className={styles.frameWrapper}>
                <div className={styles.frameContainer}>
                  <div className={styles.rectangleWrapper}>
                    <div className={styles.frameChild} />
                  </div>
                </div>
              </div>

              <div className={styles.frameItem} />
              <div>
                <div className={`${styles.whatIsDpl1}  `}>
                  Enhance Your Stay By Booking Our Products And Services, Feel
                  Free To Share With Us By Selecting This Menu Options Here -
                </div>
                <div className={styles.frameDiv}>
                  <div className={styles.frameParent1}>
                    <div className={styles.frameParent2}>
                      <div className={styles.vectorParent}>
                        <img
                          className={styles.frameInner}
                          alt=""
                          src="/static/neoMobScan/rectangle-34.svg"
                        />
                        <div className={styles.frameWrapper1}>
                          <img
                            className={styles.frameChild1}
                            loading="lazy"
                            alt=""
                            src="/static/neoMobScan/group-439.svg"
                          />
                        </div>
                        <div className={styles.frameParent3}>
                          <img
                            className={styles.frameChild2}
                            loading="lazy"
                            alt=""
                            src="/static/neoMobScan/group-441.svg"
                          />
                          <div className={styles.dPLQuestionPair}>
                            <div
                              className={styles.heading}
                              onClick={handleBookNow}
                            >
                              <b className={styles.whatIsDpl2}>Book Now</b>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.vectorGroup}>
                        <img
                          className={styles.frameInner}
                          alt=""
                          src="/static/neoMobScan/rectangle-341.svg"
                        />
                        <div className={styles.frameWrapper2}>
                          <div className={styles.frameParent5}>
                            <img
                              className={styles.frameChild3}
                              loading="lazy"
                              alt=""
                              src="/static/neoMobScan/group-405.svg"
                            />
                            <div className={styles.frameParent6}>
                              <img
                                className={styles.frameChild4}
                                alt=""
                                src="/static/neoMobScan/group-439-1.svg"
                              />
                              <img
                                className={styles.frameIcon}
                                alt=""
                                src="/static/neoMobScan/group-445.svg"
                              />
                            </div>
                          </div>
                        </div>
                        <div className={styles.frameParent7}>
                          <img
                            className={styles.frameChild2}
                            loading="lazy"
                            alt=""
                            src="/static/neoMobScan/group-441.svg"
                          />
                          <div className={styles.dPLQuestionPair}>
                            <div className={styles.heading}>
                              <b className={styles.whatIsDpl2}>Report Issue</b>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.frameParent4}>
                      <div className={styles.vectorGroup}>
                        <img
                          className={styles.frameInner}
                          alt=""
                          src="/static/neoMobScan/rectangle-341.svg"
                        />
                        <div className={styles.frameWrapper2}>
                          <div className={styles.frameParent5}>
                            <img
                              className={styles.frameChild3}
                              loading="lazy"
                              alt=""
                              src="/static/neoMobScan/group-405.svg"
                            />
                            <div className={styles.frameParent6}>
                              <img
                                className={styles.frameChild4}
                                alt=""
                                src="/static/neoMobScan/group-439-1.svg"
                              />
                              <img
                                className={styles.frameIcon}
                                alt=""
                                src="/static/neoMobScan/frame2.svg"
                              />
                            </div>
                          </div>
                        </div>
                        <div className={styles.frameParent7}>
                          <img
                            className={styles.frameChild2}
                            loading="lazy"
                            alt=""
                            src="/static/neoMobScan/group-441.svg"
                          />
                          <div className={styles.dPLQuestionPair}>
                            <div className={styles.heading}>
                              <b className={styles.whatIsDpl2}>Add Review</b>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.vectorGroup}>
                        <img
                          className={styles.frameInner}
                          alt=""
                          src="/static/neoMobScan/rectangle-341.svg"
                        />
                        <div className={styles.frameWrapper2}>
                          <div className={styles.frameParent5}>
                            <img
                              className={styles.frameChild3}
                              loading="lazy"
                              alt=""
                              src="/static/neoMobScan/group-405.svg"
                            />
                            <div className={styles.frameParent6}>
                              <img
                                className={styles.frameChild4}
                                alt=""
                                src="/static/neoMobScan/group-439-1.svg"
                              />
                              <img
                                className={styles.frameIcon}
                                alt=""
                                src="/static/neoMobScan/group-446.svg"
                              />
                            </div>
                          </div>
                        </div>
                        <div className={styles.frameParent7}>
                          <img
                            className={styles.frameChild2}
                            loading="lazy"
                            alt=""
                            src="/static/neoMobScan/group-441.svg"
                          />
                          <div className={styles.dPLQuestionPair}>
                            <div className={styles.heading}>
                              <b className={styles.whatIsDpl2}>Contact Us</b>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <NeoFooter />
      </div>
    </>
  );
};

export default MainPage;
